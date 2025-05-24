import { connectDB } from '@/lib/db';
import { TTSRequests } from '@/lib/models/TTSRequest';
import { TTSRequestSchema } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        await connectDB();

        console.log("Fetching TTS requests");

        const { searchParams } = new URL(req.url);
        const limit = Number(searchParams.get('limit') || '100');
        const userId = searchParams.get('userId');

        const query = userId ? { userId } : {};

        const requests = await TTSRequests.find(query)
            .sort({ createdAt: -1 })
            .limit(Math.min(limit, 100)); // Max 100 records

        console.log(`Found ${requests.length} TTS requests`);

        // Serialize the mongoose documents to plain objects
        return NextResponse.json(JSON.parse(JSON.stringify(requests)));
    } catch (error: any) {
        console.error("Error fetching TTS requests:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        // Validate the request body
        const validatedData = TTSRequestSchema.parse(body);

        const newRequest = await TTSRequests.create(validatedData);
        return NextResponse.json(JSON.parse(JSON.stringify(newRequest)), { status: 201 });
    } catch (error: any) {
        // Handle Zod validation errors
        if (error.errors) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
} 