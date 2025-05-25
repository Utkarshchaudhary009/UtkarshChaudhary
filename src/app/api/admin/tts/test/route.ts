// app/api/tts/route.ts
import { NextResponse } from 'next/server';
import { GeminiTTS } from '../helper/geminitts';

export const dynamic = 'force-dynamic'; // optional if you're running serverless

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const voiceName = searchParams.get('voiceName') || 'Zephyr';

    const text = `Hi, I am Sam. Which stands for Speech And Audio Machine. With voice ${voiceName}`;
    try {
        const base64Url = await GeminiTTS(process.env.GEMINI_AI_KEY!, text, "base64url");
        return NextResponse.json({ base64Url: base64Url });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
