import { connectDB } from '@/lib/db';
import { ElevenLabsConfigs } from '@/lib/models/ElevenLabsConfig';
import { ElevenLabsKeys } from '@/lib/models/ElevenLabsKey';
import { TTSRequests } from '@/lib/models/TTSRequest';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { GeminiTTS } from '../helper/geminiConv';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!
});

export async function POST(req: Request) {
    try {
        await connectDB();

        const { speakers, content }: {
            speakers: { name: string, voiceName: string }[];
            content: { speakerName: string, text: string }[];
        } = await req.json();

        if (!speakers?.length || !content?.length) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const configDoc = await ElevenLabsConfigs.findOne();
        const config = configDoc?.config || {};
        const folder = config.cloudinaryFolder || 'TTS_Audio';

        const fullText = content.map(c => `${c.speakerName}: ${c.text}`).join('\n');
        const charactersNeeded = fullText.length;

        const keys = await ElevenLabsKeys.find({ enabled: true }).sort({ usedCharacters: 1, lastUsedAt: 1 });
        if (!keys.length) {
            return NextResponse.json({ success: false, error: 'No active TTS keys available' }, { status: 503 });
        }

        let successKey = null;
        let audioPath: string | null | Buffer = null;
        const startTime = Date.now();
        const errors: string[] = [];

        for (const key of keys) {
            if (key.characterLimit - key.usedCharacters < charactersNeeded) continue;

            try {
                // Map speakers to their voice names for GeminiTTS
                const voiceMap = Object.fromEntries(speakers.map(s => [s.name, s.voiceName]));

                const filename = `TTS_MultiSpeaker_${Date.now()}.wav`;
                audioPath = await GeminiTTS(key.key, fullText, voiceMap, 'wav', filename);
                successKey = key;
                if (audioPath) break;
            } catch (err: any) {
                errors.push(`Key ${key.name} failed: ${err.message}`);
            }
        }

        if (!audioPath || !successKey) {
            await TTSRequests.create({
                text: fullText,
                voiceId: 'multi',
                status: 'failed',
                error: 'All keys failed or quota exceeded',
                apiKeyName: 'ALL',
                charactersUsed: charactersNeeded
            });

            return NextResponse.json({ success: false, error: 'All keys failed', details: errors }, { status: 503 });
        }

        // Upload to Cloudinary
        try {
            const upload = await cloudinary.uploader.upload(audioPath as string, {
                resource_type: 'video',
                folder,
                public_id: `MultiSpeaker_${Date.now()}`
            });

            const duration = Date.now() - startTime;
            const url = upload.secure_url;

            await TTSRequests.create({
                text: fullText,
                voiceId: 'multi',
                cloudinaryUrl: url,
                apiKeyName: successKey.name,
                charactersUsed: charactersNeeded,
                durationMs: duration,
                status: 'success',
                userId: 'admin' // dynamic in real use
            });

            await ElevenLabsKeys.findByIdAndUpdate(successKey._id, {
                $inc: { usedCharacters: charactersNeeded },
                lastUsedAt: new Date()
            });

            const response = {
                success: true,
                audioUrl: url,
                duration,
                charactersUsed: charactersNeeded
            };

            return NextResponse.json(response);

        } catch (cloudErr: any) {
            return NextResponse.json({
                success: false,
                error: 'Upload failed',
                message: cloudErr.message
            }, { status: 500 });
        }

    } catch (err: any) {
        return NextResponse.json({
            success: false,
            error: 'Server error',
            message: err.message
        }, { status: 500 });
    }
}
