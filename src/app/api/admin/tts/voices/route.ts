import { NextResponse } from 'next/server';

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

/**
 * GET handler for retrieving available Gemini TTS voices
 */
export async function GET() {
    try {
        const voices = geminiTTSVoices.map(voice => ({
            name: `${voice.name} - ${voice.description}`,
            voiceId: voice.name,
            description: voice.description
        }));

        return NextResponse.json(voices as GeminiTTSVoice[], { status: 200 });
    } catch (error) {
        console.error('Error fetching TTS voices:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve TTS voices' },
            { status: 500 }
        );
    }
}
