import { ConversationResponse } from "@/lib/models/conversationTTS";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_KEY,
});

const Schema = z.object({
    speakers: z.array(z.object({
        name: z.string(),
        voiceName: z.string(),
    })),
    content: z.array(z.object({
        speakerName: z.string(),
        text: z.string(),
    })),
});

async function Conversation(prompt: string, schema: z.ZodSchema) {
    const { object } = await generateObject({
        model: google('gemini-2.5-flash-preview-05-20'),
        schema: schema,
        prompt: prompt,
    });

    return object;
}

export async function POST(req: Request) {
    const { prompt } = await req.json();
    if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    const result = await Conversation(prompt, Schema);
    return NextResponse.json(result as ConversationResponse);
}
