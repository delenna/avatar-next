import {NextResponse} from "next/server";


export async function GET(request: Request) {
    // Get the query parameters from the request URL
    const { searchParams } = new URL(request.url);
    // Get the agentId from query params or fall back to environment variable
    const agentId = searchParams.get('agentId') || process.env.AGENT_ID;
    const apiKey = process.env.NEXT_PUBLIC_XI_API_KEY;
    
    if (!agentId) {
        throw new Error('AGENT_ID is not provided in the request or environment variables');
    }
    if (!apiKey) {
        throw new Error('XI_API_KEY is not set in environment variables');
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