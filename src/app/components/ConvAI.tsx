"use client"

import {Button} from "@/app/components/ui/button";
import * as React from "react";
import {useState,useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/app/components/ui/card";
import {Conversation} from "@11labs/client";
import {cn} from "@/app/lib/utils";
import { useSocket } from "../hooks/useSocket";
import Hashids from "hashids";
import dayjs from "dayjs";
// import { encryptor } from "@/app/lib/utils";
import ModalComponent from "./ui/modal";

async function requestMicrophonePermission() {
    try {
        await navigator.mediaDevices.getUserMedia({audio: true})
        return true
    } catch {
        console.error('Microphone permission denied')
        return false
    }
}

async function getSignedUrl(): Promise<string> {
    const urlParams = new URLSearchParams(window.location.search);
    let agentId = '';
    if (urlParams.get('usecase') == 'billing') {
        agentId = process.env.NEXT_PUBLIC_REMINDER_AGENT_ID || ''
    } else {
        agentId = process.env.NEXT_PUBLIC_CONVERSATION_AGENT_ID || ''
    }
    console.log('agentId', agentId)

    await updateAgent(agentId, urlParams.get('sound') || '')

    const params = new URLSearchParams();
    params.append("agentId", agentId || "");
    const response = await fetch(`/api/signed-url?${params.toString()}`)
    if (!response.ok) {
        throw Error('Failed to get signed url')
    }
    const data = await response.json()
    return data.signedUrl
}

async function registerUser(name: string, phone: string | null) {
    const hashids = new Hashids("", 6);

    const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            phone: phone,
            email: `${Date.now()}@avatar.com`,
        }),
    });

    const data = await res.json();

    const user = data.data?.user;
    const cred = data.data?.cred;
    const expiredAt = dayjs().add(7, "day").valueOf();
  
    const userId = hashids.encode(user.id);
  
    const obj = {
      id: userId,
      cred,
      email: user?.email?.toLowerCase(),
      expiredAt,
    //   name: encryptor(user.name)
    };
  
    localStorage.setItem("avatar_user", JSON.stringify(obj));
    console.log("Response:", data);
}

async function sendMessage() {

    const rawUser = JSON.parse(localStorage.getItem("avatar_user") || "{}");

    const res = await fetch('/api/message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rawUser)
    })

    const data = await res.json();
    console.log('datas', data)
}

async function updateAgent(agentId: string, sound: string) {
    // Update agent (PATCH /v1/convai/agents/:agent_id)
    const voiceId = sound == 'man' ? 'lFjzhZHq0NwTRiu2GQxy' : 'iWydkXKoiVtvdn4vLKp9';
    const response = await fetch("https://api.elevenlabs.io/v1/convai/agents/"+agentId, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "xi-api-key": process.env.NEXT_PUBLIC_XI_API_KEY || '',
        },
        body: JSON.stringify({
            "conversation_config": {
                "tts": {
                    "voice_id": voiceId
                }
            }
        }),
    });
    
    const body = await response.json();
    console.log(body);
}

export function ConvAI() {
    const socket = useSocket();
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [videoUrl, setVideoUrl] = useState("")
    // const [isAgent, setIsAgent] = useState(false)

    async function startConversation() {
        const hasPermission = await requestMicrophonePermission()
        if (!hasPermission) {
            alert("No permission")
            return;
        }
        const signedUrl = await getSignedUrl()
        const conversation = await Conversation.startSession({
            signedUrl: signedUrl,
            onConnect: () => {
                setIsConnected(true)
                setIsSpeaking(true)
            },
            onDisconnect: () => {
                setIsConnected(false)
                setIsSpeaking(false)
            },
            onError: (error) => {
                console.log(error)
                alert('An error occurred during the conversation')
            },
            onModeChange: ({mode}) => {
                setIsSpeaking(mode === 'speaking')
            },
            clientTools: {
                async escalate_to_agent(message) {
                    console.log('escalate_to_agent', message)
                    await registerUser(message.name, message.phone)

                    await sendMessage() 
                }
            }
        })
        setConversation(conversation)

        // const register = await registerUser()
    }

    async function endConversation() {
        if (!conversation) {
            return
        }
        await conversation.endSession()
        setConversation(null)
    }

    useEffect(() => {
        console.log('socket', socket)
        if (!socket) return;

        socket.on("connect_error", () => {
            console.log("connect_error")
        });

        socket.on("disconnect", () => {
            console.log("disconnect")
        });

        socket.on('connected', () => {
            console.log('connected')
        })

        socket.on('NewMessage', (message) => {
            console.log('Received message:', message)
            // handleMessage(message)
            const url = message.message.content[0].text.match(/https:\/\/\S+/)?.[0]
            console.log('url', url)
            if (url && url != '') {
                // window.open(url, '_blank')
                setVideoUrl(url)
                setIsOpen(true)
            }
        });

        return () => {
            if (socket) {
                socket.off("newMessage");
                socket.disconnect();
            }
        };
    }, [socket])

    return (
        <div className={"flex justify-center items-center gap-x-4"}>
            <Card className={'rounded-3xl'}>
                <CardContent>
                    <CardHeader>
                        <CardTitle className={'text-center'}>
                            {isConnected ? (
                                isSpeaking ? `Agent is speaking` : 'Agent is listening'
                            ) : (
                                'Disconnected'
                            )}
                        </CardTitle>
                    </CardHeader>
                    <div className={'flex flex-col gap-y-4 text-center'}>
                        <div className={cn('orb my-16 mx-12',
                            isSpeaking ? 'animate-orb' : (conversation && 'animate-orb-slow'),
                            isConnected ? 'orb-active' : 'orb-inactive')}
                        ></div>


                        <Button
                            variant={'outline'}
                            className={'rounded-full'}
                            size={"lg"}
                            disabled={conversation !== null && isConnected}
                            onClick={startConversation}
                        >
                            Start conversation
                        </Button>
                        <Button
                            variant={'outline'}
                            className={'rounded-full'}
                            size={"lg"}
                            disabled={conversation === null && !isConnected}
                            onClick={endConversation}
                        >
                            End conversation
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <ModalComponent isOpen={isOpen} setIsOpen={setIsOpen} videoUrl={videoUrl} />
        </div>
    )
}