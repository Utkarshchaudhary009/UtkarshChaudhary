// app/api/tts/route.ts
import { NextResponse } from 'next/server';
import { GeminiTTS } from '../helper/geminitts';

export const dynamic = 'force-dynamic'; // optional if you're running serverless
interface TTSResponse {
    success: boolean
    audioUrl?: string
    error?: string
    duration?: number
    charactersUsed?: number
}
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const voiceName = searchParams.get('voiceName') || 'Zephyr';

    const text = `Hi, I am Sam. Which stands for Speech And Audio Machine. With voice ${voiceName}`;
    try {
        const base64Url = await GeminiTTS(process.env.GOOGLE_AI_KEY!, text, voiceName, "base64url");
        return NextResponse.json(
            { success: true, audioUrl: base64Url, duration: 0, charactersUsed: text.length } as TTSResponse);
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
