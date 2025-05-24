// app/api/tts/list/route.ts
import { IAudio, IAudioResponse } from '@/lib/types';
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

interface CloudinaryAudio {
  public_id: string;
  secure_url: string;
  bytes: number;
  duration: number;
  format: string;
  created_at: string;
  resource_type: string;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!
});

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(2)} ${sizes[i]}`;
}

export async function GET(request: NextRequest) {
  try {
    const page = request.nextUrl.searchParams.get('page') || '1';
    const pageNum = parseInt(page, 10);
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'TTS_Audio/',
      resource_type: 'video',
      max_results: 10,
      page: pageNum
    });

    const allAudios = result.resources.map((audio: CloudinaryAudio) => {
      const rawName = audio.public_id.split('/').pop() || '';
      const isTest = rawName.toLowerCase().includes('test');
      const title = rawName
        .replace(/^TTS_/, '')
        .replace(/_/g, ' ')
        .trim();

      return {
        public_id: audio.public_id,
        url: audio.secure_url,
        title,
        isTest,
        size: formatBytes(audio.bytes),
        duration: audio.duration,
        created_at: audio.created_at,
        format: audio.format
      };
    });

    const test_audios = allAudios.filter((a: IAudio) => a.isTest);
    const audios = allAudios.filter((a: IAudio) => !a.isTest);

    return NextResponse.json({ test_audios, audios } as IAudioResponse);
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch audios', message: err.message }, { status: 500 });
  }
}
