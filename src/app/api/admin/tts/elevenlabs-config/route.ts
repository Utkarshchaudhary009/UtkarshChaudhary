import { connectDB } from '@/lib/db';
import { ElevenLabsConfig } from '@/lib/models/ElevenLabsConfig';
import { ElevenLabsConfigSchema } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectDB();
        const configDoc = await ElevenLabsConfig.findOne();
        if (!configDoc) return NextResponse.json({ error: 'Config not found' }, { status: 404 });
        return NextResponse.json(configDoc);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        // Validate the request body
        const validatedData = ElevenLabsConfigSchema.parse(body);

        const exists = await ElevenLabsConfig.findOne();
        if (exists) {
            return NextResponse.json(
                { error: 'Config already exists. Use PATCH to update.' },
                { status: 400 }
            );
        }

        const newConfig = await ElevenLabsConfig.create({ config: validatedData });
        return NextResponse.json(newConfig, { status: 201 });
    } catch (error: any) {
        // Handle Zod validation errors
        if (error.errors) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function PATCH(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        // Validate the request body
        const validatedData = ElevenLabsConfigSchema.parse(body);

        const updated = await ElevenLabsConfig.findOneAndUpdate(
            {},
            { config: validatedData },
            { new: true, upsert: true, runValidators: true }
        );

        return NextResponse.json(updated);
    } catch (error: any) {
        // Handle Zod validation errors
        if (error.errors) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE() {
    try {
        await connectDB();
        const deleted = await ElevenLabsConfig.findOneAndDelete();
        if (!deleted) return NextResponse.json({ error: 'Config not found' }, { status: 404 });
        return NextResponse.json({ message: 'Config deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 