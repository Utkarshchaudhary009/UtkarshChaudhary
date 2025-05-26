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
        const { speakers, content, conversationStyle, conversationFileName }: {
            speakers: { name: string, voiceName: string, description: string }[];
            content: { speakerName: string, text: string }[];
            conversationStyle: string;
            conversationFileName: string;
        } = await req.json();
        const MissingFields = [];
        for (const speaker of speakers) {
            if (!speaker.name) {
                MissingFields.push('Speaker Name');
            }
            if (!speaker.voiceName) {
                MissingFields.push('Voice Name');
            }
            if (!speaker.description) {
                MissingFields.push('Description');
            }
        }

        if (!conversationFileName) {
            MissingFields.push('Conversation File Name');
        }
        if (!conversationStyle) {
            MissingFields.push('Conversation Style');
        }

        if (!content?.length) {
            MissingFields.push('Content');
        }

        if (MissingFields.length) {
            return NextResponse.json({ success: false, error: `Missing Fields: ${MissingFields.join(', ')}` }, { status: 400 });
        }
        // Generate a filename based on the conversation
        const Conversation = content.map(c => `${c.speakerName}: ${c.text}`).join('\n');
        const SpeakersDetails = speakers.map(s => `${s.name} a ${s.description}`).join(' and ');
        const prompt = `The Speakers are ${SpeakersDetails} and the Conversation is ${Conversation}.`;
        const charactersNeeded = prompt.length;
        const fileId = `TTS_MultiSpeaker_${conversationFileName}.wav`;

        // Send event to Inngest for background processing
        const eventResponse = await inngest.send({
            name: "conversation.tts.requested",
            data: {
                speakers,
                prompt,
                conversationStyle,
                fileId,
                userId: "admin" // Replace with actual user ID in production
            },
        });

        // Connect to DB to get configuration for generating URL
        await connectDB();
        const configDoc = await ElevenLabsConfigs.findOne();
        const config = configDoc?.config || {};
        const folder = config.cloudinaryFolder || 'TTS_Audio';

        // Return immediate response with job information
        return NextResponse.json({
            success: true,
            message: "Conversation TTS processing started",
            jobId: eventResponse.ids[0], // Inngest event ID for tracking
            status: "processing",
            queuedAt: new Date().toISOString(),
            // Provide anticipated URL where the audio will be uploaded
            audioUrl: GenerateCloudinaryUrl(`${folder}/${fileId}`),
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
