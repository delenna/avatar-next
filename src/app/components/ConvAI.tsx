"use client"

import {Button} from "@/app/components/ui/button";
import * as React from "react";
import {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/app/components/ui/card";
import {Conversation} from "@11labs/client";
import {cn} from "@/app/lib/utils";
import { useSocket } from "../hooks/useSocket";
import Hashids from "hashids";
import dayjs from "dayjs";
import { encryptor } from "@/app/lib/utils";
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
    const response = await fetch('/api/signed-url')
    if (!response.ok) {
        throw Error('Failed to get signed url')
    }
    const data = await response.json()
    return data.signedUrl
}

async function registerUser() {
    const hashids = new Hashids("", 6);

    const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: `avatar-${Date.now()}`,
            phone: Date.now(),
            email: `${Date.now()}@gmail.com`,
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
      name: encryptor(user.name)
    };
  
    localStorage.setItem("avatar_user", JSON.stringify(obj));
    console.log("Response:", data);
}

function handleMessage(data: any) {
    console.log("handle message", data)
    // if (data.message && data.message.content.length && data.message.content.type === 'text' && data.message.content[0].text.includes('lenna.ai/call')) {
        const url = data.message.content[0].text.match(/https:\/\/\S+/)?.[0]
        console.log('url', url)
        window.open(url, '_blank', 'noopener,noreferrer')
    // }
}

export function ConvAI() {
    const socket =  useSocket();
    const [conversation, setConversation] = useState<Conversation | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [videoUrl, setVideoUrl] = useState("")

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
        })
        setConversation(conversation)

        const register = await registerUser()
    }

    async function endConversation() {
        if (!conversation) {
            return
        }
        await conversation.endSession()
        setConversation(null)
    }

    useEffect(() => {
        if (!socket) return;

        socket.on("connect_error", () => {
            console.log("connect_error")
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
            socket.off("message");
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