import { ConversationResponse } from "@/lib/models/conversationTTS";
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

interface GeminiTTSVoice {
    name: string;
    description: string;
}
const geminiTTSVoices: GeminiTTSVoice[] = [
    { name: "Zephyr", description: "Bright" },
    { name: "Puck", description: "Upbeat" },
    { name: "Charon", description: "Informative" },
    { name: "Kore", description: "Firm" },
    { name: "Fenrir", description: "Excitable" },
    { name: "Leda", description: "Youthful" },
    { name: "Orus", description: "Firm" },
    { name: "Aoede", description: "Breezy" },
    { name: "Callirhoe", description: "Easy-going" },
    { name: "Autonoe", description: "Bright" },
    { name: "Enceladus", description: "Breathy" },
    { name: "Iapetus", description: "Clear" },
    { name: "Umbriel", description: "Easy-going" },
    { name: "Algieba", description: "Smooth" },
    { name: "Despina", description: "Smooth" },
    { name: "Erinome", description: "Clear" },
    { name: "Algenib", description: "Gravelly" },
    { name: "Rasalgethi", description: "Informative" },
    { name: "Laomedeia", description: "Upbeat" },
    { name: "Achernar", description: "Soft" },
    { name: "Alnilam", description: "Firm" },
    { name: "Schedar", description: "Even" },
    { name: "Gacrux", description: "Mature" },
    { name: "Pulcherrima", description: "Forward" },
    { name: "Achird", description: "Friendly" },
    { name: "Zubenelgenubi", description: "Casual" },
    { name: "Vindemiatrix", description: "Gentle" },
    { name: "Sadachbia", description: "Lively" },
    { name: "Sadaltager", description: "Knowledgeable" },
    { name: "Sulafat", description: "Warm" }
];

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_KEY,
});
const voiceNames = geminiTTSVoices.map(voice => voice.name);
const Schema = z.object({
    speakers: z.array(z.object({
        name: z.string(),
        voiceName: z.enum(voiceNames as [string, ...string[]]),
        description: z.string().min(2),
    })),
    content: z.array(z.object({
        speakerName: z.string(),
        text: z.string(),
    })),
    conversationStyle: z.string().min(5).describe("The style of the conversation like podcast, interview,friends casual banter,family,etc."),
    conversationFileName: z.string().min(4).describe("The name of the conversation file based conversation."),
});

async function Conversation(prompt: string, schema: z.ZodSchema) {
    let object: any;
    for (let i = 0; i < 3; i++) {
        try {
            const { object: result } = await generateObject({
                model: google('gemini-2.5-flash-preview-05-20'),
                schema: schema,
                prompt: `${prompt} with help of voices ${geminiTTSVoices}. The Speakers should be described as there role in the conversation as per there tone,mood,and personality in 5 words.NOTE: The Speakers should not be described as description of voices.Description of voices are just to help you choose the right voice for the speaker. Give the conversation style{like podcast, interview,friends casual banter,family,etc.} in 5 words and file name as per the conversation summary in 5 words.`,
            });
            object = result;
            break;
        } catch (error) {
            console.error('Error in Conversation:', error);
            continue;
        }
    }
    object.conversationFileName = object.conversationFileName.replace(/ /g, '_').trim()
    if (!object) {
        return { error: 'No object returned' };
    }
    return object;
}

export async function POST(req: Request) {
    const { prompt } = await req.json();
    if (!prompt) {
        return NextResponse.json({ success: false, error: 'Prompt is required' } as ConversationResponse, { status: 400 });
    }
    const conversation = await Conversation(prompt, Schema);
    if (conversation.error) {

        return NextResponse.json({ success: false, error: conversation.error } as ConversationResponse, { status: 500 });
    }
    const result: ConversationResponse = {
        success: true,
        speakers: conversation.speakers,
        content: conversation.content,
    }
    return NextResponse.json(result as ConversationResponse);
}
