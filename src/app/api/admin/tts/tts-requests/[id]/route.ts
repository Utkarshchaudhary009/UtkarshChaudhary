import { connectDB } from '@/lib/db';
import { TTSRequest } from '@/lib/models/TTSRequest';
import { TTSRequestSchema } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const request = await TTSRequest.findById((await params).id);
        if (!request) return NextResponse.json({ error: 'TTS request not found' }, { status: 404 });
        return NextResponse.json(request);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const body = await req.json();

        // Validate the request body
        const validatedData = TTSRequestSchema.partial().parse(body);

        const updated = await TTSRequest.findByIdAndUpdate(
            (await params).id,
            validatedData,
            { new: true, runValidators: true }
        );

        if (!updated) return NextResponse.json({ error: 'TTS request not found' }, { status: 404 });
        return NextResponse.json(updated);
    } catch (error: any) {
        // Handle Zod validation errors
        if (error.errors) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const deleted = await TTSRequest.findByIdAndDelete((await params).id);
        if (!deleted) return NextResponse.json({ error: 'TTS request not found' }, { status: 404 });
        return NextResponse.json({ message: 'TTS request deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 