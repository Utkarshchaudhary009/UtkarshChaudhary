import { connectDB } from '@/lib/db';
import { ElevenLabsConfigs } from '@/lib/models/ElevenLabsConfig';
import { ElevenLabsKeys } from '@/lib/models/ElevenLabsKey';
import { TTSRequests } from '@/lib/models/TTSRequest';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!
});

export async function POST(req: Request) {
  await connectDB();
  const { text, title } = await req.json();
  if (!text) return NextResponse.json({ error: 'Text is required' }, { status: 400 });

  const charactersNeeded = text.length;

  const configDoc = await ElevenLabsConfigs.findOne();
  const config = configDoc?.config || {};
  const voiceId = config.defaultVoiceId || 'EXAVITQu4vr4xnSDxMaL';
  if (!voiceId) return NextResponse.json({ error: 'No default voice ID configured' }, { status: 500 });

  const keys = await ElevenLabsKeys.find({ enabled: true }).sort({
    usedCharacters: 1,     // least-used first
    lastUsedAt: 1
  });

  if (!keys.length) {
    return NextResponse.json({ error: 'No active API keys available' }, { status: 500 });
  }

  let successfulKey: any = null;
  let audioBuffer: Buffer | null = null;
  let errorLog: string[] = [];
  const startTime = Date.now();

  for (const keyDoc of keys) {
    const remaining = keyDoc.characterLimit - keyDoc.usedCharacters;
    if (remaining < charactersNeeded) continue;

    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          text,
          voice_settings: config.voiceSettings || {
            stability: 0.3,
            similarity_boost: 0.75
          }
        },
        {
          responseType: 'arraybuffer',
          headers: {
            'xi-api-key': keyDoc.key,
            'Content-Type': 'application/json'
          }
        }
      );

      audioBuffer = Buffer.from(response.data);
      successfulKey = keyDoc;
      break;
    } catch (error: any) {
      errorLog.push(`Key "${keyDoc.name}" failed: ${error.message}`);
    }
  }

  if (!successfulKey || !audioBuffer) {
    await TTSRequests.create({
      text,
      voiceId,
      status: 'failed',
      error: 'All keys failed or quota exceeded',
      apiKeyName: 'ALL_TRIED',
      charactersUsed: charactersNeeded
    });
    return NextResponse.json({ error: 'All keys failed', details: errorLog }, { status: 500 });
  }

  try {
    const fileName = `TTS_${title ? title : randomUUID()}.mp3`;

    const cloudinaryUrl = await new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          folder: config.cloudinaryFolder || 'TTS_Audio',
          public_id: fileName.replace('.mp3', '')
        },
        (err, result) => {
          if (err || !result) return reject(err);
          resolve(result.secure_url);
        }
      );
      Readable.from(audioBuffer).pipe(stream);
    });

    const durationMs = Date.now() - startTime;

    await TTSRequests.create({
      text,
      voiceId,
      cloudinaryUrl,
      apiKeyName: successfulKey.name,
      charactersUsed: charactersNeeded,
      durationMs,
      status: 'success',
      userId: 'admin' // Optional: Replace with real user ID if needed
    });

    await ElevenLabsKeys.findByIdAndUpdate(successfulKey._id, {
      $inc: { usedCharacters: charactersNeeded },
      lastUsedAt: new Date()
    });

    return NextResponse.json({
      url: cloudinaryUrl,
      voiceId,
      usedKey: successfulKey.name,
      charactersUsed: charactersNeeded,
      durationMs
    });

  } catch (cloudErr: any) {
    await TTSRequests.create({
      text,
      voiceId,
      status: 'failed',
      apiKeyName: successfulKey.name,
      charactersUsed: charactersNeeded,
      error: 'Cloudinary upload failed'
    });

    return NextResponse.json({ error: 'Cloudinary upload failed', message: cloudErr.message }, { status: 500 });
  }
}
