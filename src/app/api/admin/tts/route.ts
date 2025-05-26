import { connectDB } from '@/lib/db';
import { ElevenLabsConfigs } from '@/lib/models/ElevenLabsConfig';
import { NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest/client';

function GenerateCloudinaryUrl(fileId: string) {
  // https://res.cloudinary.com/dgdfxsuoh/video/upload/v1748061490/TTS_Audio/TTS_gemini-2-5-a-leap-forward-in-ai-capabilities.mp3
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/${fileId}`;
}
/**
 * Text-to-Speech API endpoint
 * 
 * Instead of processing TTS directly, this endpoint now triggers
 * an Inngest event that will be processed asynchronously
 */

export async function POST(req: Request) {
  try {

    // Extract request data
    const { text, title } = await req.json();
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }


    // Send event to Inngest for background processing
    const eventResponse = await inngest.send({
      name: "tts.requested",
      data: {
        text,
        title: title || "Untitled",
        userId: "admin", // Replace with actual user ID in production
      },
    });

    await connectDB();
    const configDoc = await ElevenLabsConfigs.findOne();
    const config = configDoc?.config || {};
    const fileName = `TTS_${title ? title : "test"}.wav`;
    const folder = config.cloudinaryFolder || 'TTS_Audio';
    // Return immediate response with job information
    return NextResponse.json({
      message: "TTS processing started",
      audioUrl: GenerateCloudinaryUrl(`${folder}/${fileName}`), // Inngest event ID for tracking
      success: true,
      charactersUsed: text.length,
      jobId: eventResponse.ids[0], // Inngest event ID for tracking
      status: "processing",
      queuedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('TTS request error:', error);

    return NextResponse.json(
      {
        error: 'Failed to queue TTS request',
        message: error.message
      },
      { status: 500 }
    );
  }
}
