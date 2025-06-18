import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server'

export async function POST(req: Request) {
    const supabase = await createClient()
    try {
        const body = await req.json();
        const { data, error } = await supabase.from('configuration').update({voice_id: body.voiceId}).eq('id', 1)
        // const { data, error } = await supabase.from('configuration').select()
        if (error) {
            console.error('Supabase update error:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    
        return NextResponse.json({ data })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error })
    }
}
    