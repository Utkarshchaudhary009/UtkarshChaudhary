import { connectDB } from '@/lib/db';
import { TTSRequests } from '@/lib/models/TTSRequest';
import { TTSRequestSchema } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        console.log(`Fetching TTS request with ID: ${params.id}`);

        const request = await TTSRequests.findById(params.id);

        if (!request) {
            console.log(`TTS request not found with ID: ${params.id}`);
            return NextResponse.json({ error: 'TTS request not found' }, { status: 404 });
        }

        console.log(`Found TTS request with ID: ${request._id}`);
        return NextResponse.json(request);
    } catch (error: any) {
        console.error(`Error fetching TTS request ${params.id}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const body = await req.json();

        // Validate the request body
        const validatedData = TTSRequestSchema.partial().parse(body);

        const updated = await TTSRequests.findByIdAndUpdate(
            params.id,
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

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const deleted = await TTSRequests.findByIdAndDelete(params.id);
        if (!deleted) return NextResponse.json({ error: 'TTS request not found' }, { status: 404 });
        return NextResponse.json({ message: 'TTS request deleted successfully' });
    } catch (error: any) {
        console.error(`Error deleting TTS request ${params.id}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 