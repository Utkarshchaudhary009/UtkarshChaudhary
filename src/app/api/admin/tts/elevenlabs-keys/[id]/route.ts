import { connectDB } from '@/lib/db';
import { ElevenLabsKey } from '@/lib/models/ElevenLabsKey';
import { ElevenLabsKeySchema } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }>  }) {
    try {
        await connectDB();
        const key = await ElevenLabsKey.findById((await params).id);
        if (!key) return NextResponse.json({ error: 'ElevenLabs key not found' }, { status: 404 });
        return NextResponse.json(key);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }>  }) {
    try {
        await connectDB();
        const body = await req.json();

        // Validate the request body
        const validatedData = ElevenLabsKeySchema.partial().parse(body);

        const updated = await ElevenLabsKey.findByIdAndUpdate(
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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }>  }) {
    try {
        await connectDB();
        const deleted = await ElevenLabsKey.findByIdAndDelete((await params).id);
        if (!deleted) return NextResponse.json({ error: 'ElevenLabs key not found' }, { status: 404 });
        return NextResponse.json({ message: 'ElevenLabs key deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 