"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Trash, ArrowLeft } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import AudioVisualizer from "@/app/components/audio-visualizer"
import { useRouter } from "next/navigation"

export default function SpeechTranscription() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isRecording, setIsRecording] = useState(false)
  // Chat message type
  type Message = { text: string; sender: 'user' | 'bot' }
  const [transcript, setTranscript] = useState<Message[]>([])
  const [currentText, setCurrentText] = useState("")
  const transcriptRef = useRef<HTMLDivElement>(null)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    // Scroll to bottom when transcript updates
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript])

  // WebSocket and audio processing refs
  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)

  // Helper: Convert Float32Array to 16-bit PCM
  function floatTo16BitPCM(input: Float32Array) {
    const output = new Int16Array(input.length)
    for (let i = 0; i < input.length; i++) {
      let s = Math.max(-1, Math.min(1, input[i]))
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
    }
    return output
  }

  // Helper: Downsample buffer to 16kHz
  function downsampleBuffer(buffer: Float32Array, inputSampleRate: number, outputSampleRate = 16000) {
    if (outputSampleRate === inputSampleRate) {
      return buffer
    }
    const sampleRateRatio = inputSampleRate / outputSampleRate
    const newLength = Math.round(buffer.length / sampleRateRatio)
    const result = new Float32Array(newLength)
    let offsetResult = 0
    let offsetBuffer = 0
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio)
      // Average the samples in between
      let accum = 0, count = 0
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i]
        count++
      }
      result[offsetResult] = accum / count
      offsetResult++
      offsetBuffer = nextOffsetBuffer
    }
    return result
  }

  // Cleanup function for audio & ws
  const cleanup = () => {
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop())
      setAudioStream(null)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  const updateAgent = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sound = urlParams.get('sound') || '';
    try {
      const response = await fetch(`/api/configuration`, {
        method: 'POST',
        body: JSON.stringify({
          voiceId: sound == 'man' ? 'id-ID-Wavenet-C' : 'id-ID-Wavenet-D'
        })
      });
    } catch (error) {
      console.log(error);
    }
  }

  const startRecording = async () => {
    await updateAgent();
    try {
      const ws = new window.WebSocket("ws://localhost:8000/ws")
      ws.binaryType = 'arraybuffer'
      wsRef.current = ws
      setTranscript([])
      setCurrentText("")

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioStream(stream)
      const audioContext = new window.AudioContext({ sampleRate: 44100 }) // Most mics default to 44.1kHz
      audioContextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0)
        const downsampled = downsampleBuffer(inputData, audioContext.sampleRate, 16000)
        const pcm16 = floatTo16BitPCM(downsampled)
        if (ws.readyState === 1) {
          ws.send(pcm16.buffer)
        }
      }

      source.connect(processor)
      processor.connect(audioContext.destination)
      setIsRecording(true)

      ws.onmessage = (event) => {
        // Expecting JSON with {text: "...", isFinal: bool, sender?: 'user' | 'bot'}
        try {
          if (typeof event.data == "string") {
            const data = JSON.parse(event.data)
            // Stop audio if speaking toggle is sent from socket
            if (data.type === "speaking") {
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              return;
            }
            if (data.isFinal) {
              setTranscript((prev) => [...prev, { text: data.text, sender: data.sender || 'bot' }])
              setCurrentText("")
            } else {
              setCurrentText(data.text)
            }
          } else if (event.data instanceof ArrayBuffer) {
            // Received raw audio bytes (e.g., WAV)
            const blob = new Blob([event.data], { type: "audio/wav" });
            const url = URL.createObjectURL(blob);
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
            audioRef.current = new Audio(url);
            audioRef.current.play();
          }
        } catch (e) {
          // If backend just sends plain text, treat as bot interim
          setCurrentText(event.data)
        }
      }
      ws.onerror = (err) => {
        console.error("WebSocket error", err)
        setIsRecording(false)
        cleanup()
      }
      ws.onclose = () => {
        setIsRecording(false)
        cleanup()
      }
    } catch (error) {
      console.error("Error accessing microphone or connecting to WebSocket:", error)
      alert("Unable to access microphone or connect to backend. Please check permissions and backend status.")
      cleanup()
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (currentText) {
      setTranscript((prev) => [...prev, { text: currentText, sender: 'user' }])
      setCurrentText("")
    }
    cleanup()
  }

  const clearTranscript = () => {
    setTranscript([])
    setCurrentText("")
  }

  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center min-w-screen">
      <main className="container mx-auto flex max-w-2xl flex-1 flex-col items-center justify-start gap-6 py-8">
        <div className="flex flex-col items-center w-full">
          <Button
            variant="ghost"
            onClick={() => router.push('/configuration')}
            className="self-start -ml-2 mb-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Configuration
          </Button>
          <h1 className="text-center text-3xl font-light tracking-tight text-gray-900 dark:text-gray-100">
            Conversational AI
          </h1>
        </div>

        <div className="relative w-full rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          {/* Status indicator */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${isRecording ? "animate-pulse bg-red-500" : "bg-gray-300 dark:bg-gray-600"}`}
              />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {isRecording ? "Recording..." : "Not recording"}
              </span>
            </div>

            {(transcript.length > 0 || currentText) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearTranscript}
                className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Clear transcript</span>
              </Button>
            )}
          </div>

          {/* Audio Visualizer */}
          {isRecording && audioStream && (
            <div className="mb-4 flex justify-center">
              <AudioVisualizer stream={audioStream} />
            </div>
          )}

          {/* Transcript display */}
          <div
            ref={transcriptRef}
            className="mb-4 h-64 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            {transcript.length === 0 && !currentText ? (
              <p className="text-center text-gray-400 dark:text-gray-500">Transcript will appear here...</p>
            ) : (
              <div className="flex flex-col gap-2">
                {transcript.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs rounded-2xl px-4 py-2 text-base shadow-md
                        ${msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 rounded-bl-none'}`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {currentText && (
                  <div className="flex justify-start">
                    <div className="max-w-xs rounded-2xl rounded-bl-none bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 px-4 py-2 text-base shadow-md opacity-70">
                      {currentText}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800"
              >
                <Mic className="h-4 w-4" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" className="gap-2">
                <MicOff className="h-4 w-4" />
                Stop Recording
              </Button>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
