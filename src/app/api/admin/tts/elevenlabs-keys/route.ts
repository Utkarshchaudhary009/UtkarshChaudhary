import { connectDB } from '@/lib/db';
import { ElevenLabsKey } from '@/lib/models/ElevenLabsKey';
import { ElevenLabsKeySchema } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        await connectDB();
        const keys = await ElevenLabsKey.find().sort({ createdAt: -1 });
        return NextResponse.json(keys);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        // Validate the request body
        const validatedData = ElevenLabsKeySchema.parse(body);

        const newKey = await ElevenLabsKey.create(validatedData);
        return NextResponse.json(newKey, { status: 201 });
    } catch (error: any) {
        // Handle Zod validation errors
        if (error.errors) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
} 