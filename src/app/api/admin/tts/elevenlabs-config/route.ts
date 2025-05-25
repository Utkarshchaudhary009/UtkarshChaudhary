import { formatStringDate } from '@/app/api/admin/tts/helper/formatStringDate';
import { connectDB } from '@/lib/db';
import { ElevenLabsConfigs } from '@/lib/models/ElevenLabsConfig';
import { ElevenLabsConfigSchema } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectDB();
        console.log("Fetching ElevenLabs config");

        const configDoc = await ElevenLabsConfigs.findOne();

        if (!configDoc) {
            console.log("ElevenLabs config not found");
            return NextResponse.json({ error: 'Config not found' }, { status: 404 });
        }

        console.log("Found ElevenLabs config");
        return NextResponse.json(JSON.parse(JSON.stringify(configDoc)));
    } catch (error: any) {
        console.error("Error fetching ElevenLabs config:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        // Validate the request body
        const validatedData = ElevenLabsConfigSchema.parse(body);

        const exists = await ElevenLabsConfigs.findOne();
        if (exists) {
            return NextResponse.json(
                { error: 'Config already exists. Use PATCH to update.' },
                { status: 400 }
            );
        }

        const newConfig = await ElevenLabsConfigs.create({ config: validatedData });
        return NextResponse.json(JSON.parse(JSON.stringify(newConfig)), { status: 201 });
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

        if (body.lastCheckedAt) {
            body.lastCheckedAt = formatStringDate(body.createdAt)
        }
        if (body.updatedAt) {
            body.updatedAt = formatStringDate(body.updatedAt)
        }
        // Validate the request body
        const validatedData = ElevenLabsConfigSchema.parse(body);

        const updated = await ElevenLabsConfigs.findOneAndUpdate(
            {},
            { config: validatedData },
            { new: true, upsert: true, runValidators: true }
        );

        return NextResponse.json(JSON.parse(JSON.stringify(updated)));
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
        const deleted = await ElevenLabsConfigs.findOneAndDelete();
        if (!deleted) return NextResponse.json({ error: 'Config not found' }, { status: 404 });
        return NextResponse.json({ message: 'Config deleted successfully' });
    } catch (error: any) {
        console.error("Error deleting ElevenLabs config:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 