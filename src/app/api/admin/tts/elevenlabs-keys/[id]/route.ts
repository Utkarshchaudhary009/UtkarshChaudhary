import { connectDB } from '@/lib/db';
import { ElevenLabsKeys } from '@/lib/models/ElevenLabsKey';
import { ElevenLabsKeySchema } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        console.log(`Fetching ElevenLabs key with ID: ${(await params).id}`);

        const key = await ElevenLabsKeys.findById((await params).id);

        if (!key) {
            console.log(`ElevenLabs key not found with ID: ${(await params).id}`);
            return NextResponse.json({ error: 'ElevenLabs key not found' }, { status: 404 });
        }

        console.log(`Found ElevenLabs key: ${key.name}`);
        return NextResponse.json(key);
    } catch (error: any) {
        console.error(`Error fetching ElevenLabs key ${(await params).id}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const body = await req.json();

        // Validate the request body
        const validatedData = ElevenLabsKeySchema.partial().parse(body);

        const updated = await ElevenLabsKeys.findByIdAndUpdate(
            (await params).id,
            validatedData,
            { new: true, runValidators: true }
        );

        if (!updated) return NextResponse.json({ error: 'ElevenLabs key not found' }, { status: 404 });
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
        const deleted = await ElevenLabsKeys.findByIdAndDelete((await params).id);
        if (!deleted) return NextResponse.json({ error: 'ElevenLabs key not found' }, { status: 404 });
        return NextResponse.json({ message: 'ElevenLabs key deleted successfully' });
    } catch (error: any) {
        console.error(`Error deleting ElevenLabs key ${(await params).id}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 