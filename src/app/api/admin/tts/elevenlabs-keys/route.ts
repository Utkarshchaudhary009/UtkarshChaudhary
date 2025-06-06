import { connectDB } from '@/lib/db';
import { ElevenLabsKeys } from '@/lib/models/ElevenLabsKey';
import { ElevenLabsKeySchema } from '@/lib/types';
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await connectDB()

        // Log to debug
        console.log("Fetching ElevenLabs keys");

        const keys = await ElevenLabsKeys.find().sort({ createdAt: -1 });
        // Log the result to debug
        console.log(`Found ${keys.length} keys`);

        // Serialize the mongoose documents to plain objects
        return NextResponse.json(JSON.parse(JSON.stringify(keys)));
    } catch (error: any) {
        console.error("Error fetching ElevenLabs keys:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        // Validate the request body
        const validatedData = ElevenLabsKeySchema.parse(body);

        const newKey = await ElevenLabsKeys.create(validatedData);
        return NextResponse.json(JSON.parse(JSON.stringify(newKey)), { status: 201 });
    } catch (error: any) {
        // Handle Zod validation errors
        if (error.errors) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}