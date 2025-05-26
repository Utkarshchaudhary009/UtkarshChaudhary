import { connectDB } from '@/lib/db';
import { inngest } from '@/lib/inngest/client';
import { ElevenLabsConfigs } from '@/lib/models/ElevenLabsConfig';
import { NextResponse } from 'next/server';

function GenerateCloudinaryUrl(fileId: string) {
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/${fileId}`;
}

export async function POST(req: Request) {
    try {
        // Extract the request data
        const { speakers, content }: {
            speakers: { name: string, voiceName: string }[];
            content: { speakerName: string, text: string }[];
        } = await req.json();

        if (!speakers?.length || !content?.length) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Send event to Inngest for background processing
        const eventResponse = await inngest.send({
            name: "conversation.tts.requested",
            data: {
                speakers,
                content,
                userId: "admin" // Replace with actual user ID in production
            },
        });

        // Connect to DB to get configuration for generating URL
        await connectDB();
        const configDoc = await ElevenLabsConfigs.findOne();
        const config = configDoc?.config || {};
        const folder = config.cloudinaryFolder || 'TTS_Audio';

        // Generate a filename based on the conversation
        const fullText = content.map(c => `${c.speakerName}: ${c.text}`).join('\n');
        const charactersNeeded = fullText.length;
        const filename = `MultiSpeaker_${Date.now()}`;

        // Return immediate response with job information
        return NextResponse.json({
            success: true,
            message: "Conversation TTS processing started",
            jobId: eventResponse.ids[0], // Inngest event ID for tracking
            status: "processing",
            queuedAt: new Date().toISOString(),
            // Provide anticipated URL where the audio will be uploaded
            audioUrl: GenerateCloudinaryUrl(`${folder}/${filename}`),
            charactersUsed: charactersNeeded
        });

    } catch (err: any) {
        return NextResponse.json({
            success: false,
            error: 'Failed to queue Conversation TTS request',
            message: err.message
        }, { status: 500 });
    }
}
