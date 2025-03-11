import {NextResponse} from "next/server";
import Hashids from "hashids";
import dayjs from "dayjs";
import { encryptor } from "@/app/lib/utils";

const OMNICHANNEL_URL = "https://staging.lenna.ai";
export async function GET() {
    const agentId = process.env.AGENT_ID
    const apiKey = process.env.XI_API_KEY
    if (!agentId) {
        throw Error('AGENT_ID is not set')
    }
    if (!apiKey) {
        throw Error('XI_API_KEY is not set')
    }
    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
            {
                method: 'GET',
                headers: {
                    'xi-api-key': apiKey,
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to get signed URL');
        }

        const data = await response.json();
        return NextResponse.json({signedUrl: data.signed_url})
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to get signed URL' }, { status: 500 });
    }
}

export async function POST() {
    const appId = "PdyJge";
    const integrationId = "1663";
  
    const hashids = new Hashids("", 6);
    const url = new URL(`/${appId}/register/webchat`, OMNICHANNEL_URL);

    console.log('url: ' + url);
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: `pengguna-${Date.now()}`,
                phone: Date.now(),
                email: `${Date.now()}@gmail.com`
            })
        });
    
        const response = await res.json();
        
        console.log('response', response);
        const user = response.data?.user;
        const cred = response.data?.cred;
        const expiredAt = dayjs().add(7, "day").valueOf();
        
        const userId = hashids.encode(user.id);
      
        const obj = {
          id: userId,
          cred,
          email: user?.email?.toLowerCase(),
          expiredAt,
          name: encryptor(user.name)
        };
    
        return NextResponse.json(obj)
    } catch (err) {
        console.error('Error:', err);
        return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
    }
}