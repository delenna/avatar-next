"use client"

import { useRef, useEffect } from "react"

interface AudioVisualizerProps {
  stream: MediaStream
}

export default function AudioVisualizer({ stream }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const analyserRef = useRef<AnalyserNode>(null)

  useEffect(() => {
    if (!canvasRef.current || !stream) return

    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    analyserRef.current = analyser
    analyser.fftSize = 256
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const source = audioContext.createMediaStreamSource(stream)
    source.connect(analyser)

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions - making it smaller
    const setCanvasSize = () => {
      const size = Math.min(200, window.innerWidth - 60) // Smaller size
      canvas.width = size
      canvas.height = size
    }
    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    // Store bubbles
    const bubbles: any[] = []
    const maxBubbles = 15 // Maximum number of bubbles

    // Animation function
    const draw = () => {
      if (!ctx || !analyserRef.current) return

      animationRef.current = requestAnimationFrame(draw)
      analyserRef.current.getByteFrequencyData(dataArray)

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate average frequency
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i]
      }
      const average = sum / bufferLength

      // Draw base circle
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const baseRadius = Math.min(canvas.width, canvas.height) * 0.25 // Smaller base radius

      // Draw pulsing base circle
      const pulseAmount = (average / 255) * 8
      ctx.beginPath()
      ctx.arc(centerX, centerY, Math.max(0.1, baseRadius + pulseAmount), 0, 2 * Math.PI)
      ctx.fillStyle = `rgba(16, 185, 129, ${0.2 + (average / 255) * 0.3})`
      ctx.fill()

      // Create new bubbles based on audio intensity
      if (average > 30) {
        // Only create bubbles when there's significant sound
        const threshold = 180 - average // Dynamic threshold based on volume
        if (baseRadius <= 0) return
        if (Math.random() * 255 > threshold && bubbles.length < maxBubbles) {
          // Create bubble with random angle
          const angle = Math.random() * Math.PI * 2
          const distance = baseRadius * 0.7 // Start closer to center
          const size = 3 + Math.random() * 10 * (average / 255) // Size based on volume

          // Calculate starting position
          const x = centerX + Math.cos(angle) * distance
          const y = centerY + Math.sin(angle) * distance

          // Random speed based on volume
          const speed = 0.5 + (average / 255) * 2

          // Add bubble
          bubbles.push({
            x,
            y,
            size,
            angle,
            speed,
            opacity: 0.7 + Math.random() * 0.3,
            life: 100, // Bubble lifetime
            hue: Math.random() > 0.7 ? 160 : 140, // Slight color variation
          })
        }
      }

      // Update and draw bubbles
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const bubble = bubbles[i]

        // Move bubble outward
        bubble.x += Math.cos(bubble.angle) * bubble.speed
        bubble.y += Math.sin(bubble.angle) * bubble.speed

        // Decrease life
        bubble.life -= 1.5

        // Adjust size and opacity based on life
        const lifeRatio = bubble.life / 100
        const currentSize = Math.max(0.1, bubble.size * lifeRatio)
        const currentOpacity = bubble.opacity * lifeRatio

        // Draw bubble
        ctx.beginPath()
        ctx.arc(bubble.x, bubble.y, currentSize, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${bubble.hue}, 80%, 60%, ${currentOpacity})`
        ctx.fill()

        // Remove dead bubbles
        if (bubble.life <= 0) {
          bubbles.splice(i, 1)
        }
      }

      // Draw center pulsing circle
      const innerRadius = Math.max(0.1, baseRadius * 0.5 + (average / 255) * 5)
      ctx.beginPath()
      ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI)
      ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + (average / 255) * 0.4})`
      ctx.fill()
    }

    // Start animation
    draw()

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      audioContext.close()
      window.removeEventListener("resize", setCanvasSize)
    }
  }, [stream])

  return (
    <div className="relative flex items-center justify-center">
      <canvas ref={canvasRef} className="rounded-full" width={200} height={200} />
    </div>
  )
}
