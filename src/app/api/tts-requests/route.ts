import {connectDB} from '@/lib/db';
import { TTSRequest } from '@/lib/models/TTSRequest';
import { TTSRequestSchema } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const limit = Number(searchParams.get('limit') || '100');
        const userId = searchParams.get('userId');

        const query = userId ? { userId } : {};

        const requests = await TTSRequest.find(query)
            .sort({ createdAt: -1 })
            .limit(Math.min(limit, 100)); // Max 100 records

        return NextResponse.json(requests);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        // Validate the request body
        const validatedData = TTSRequestSchema.parse(body);

        const newRequest = await TTSRequest.create(validatedData);
        return NextResponse.json(newRequest, { status: 201 });
    } catch (error: any) {
        // Handle Zod validation errors
        if (error.errors) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
} 