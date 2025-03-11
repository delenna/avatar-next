import { NextResponse } from 'next/server';

const OMNICHANNEL_URL = process.env.OMNICHANNEL_URL || "https://staging.lenna.ai/app/public/api";

export async function POST(req: Request) {
    try {
        const appId = "PdyJge";
        const integrationId = "RdGB3b";
        const body = await req.json(); // Get data from client
        body.integrationId = integrationId;
        const response = await fetch(`${OMNICHANNEL_URL}/${appId}/register/webchat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "error" }, { status: 500 });
    }
}
