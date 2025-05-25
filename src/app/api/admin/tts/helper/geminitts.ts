// app/api/tts/route.ts
import { GoogleGenAI } from '@google/genai';
import wav from 'wav';

async function saveWaveFile(
    filename: string,
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2,
) {
    return new Promise((resolve, reject) => {
        const writer = new wav.FileWriter(filename, {
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8,
        });

        writer.on('finish', resolve);
        writer.on('error', reject);

        writer.write(pcmData);
        writer.end();
    });
}
const errorBuffer: Buffer = Buffer.from("Sorry Some Error Occured");

export async function GeminiTTS(apiKey: string, text: string, voiceName: string = "Zephyr", type: "mp3" | "base64url" | "base64" = "mp3", fileName: string = "test.mp3"): Promise<string | Buffer> {

    if (!apiKey && !process.env.GOOGLE_AI_KEY) {
        throw new Error("API key is required. Please provide an API key or set GEMINI_AI_KEY environment variable.");
    }

    for (let i = 0; i < 5; i++) {
        if (i !== 0 && i % 2 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        try {

            let Key: string = apiKey || process.env.GEMINI_AI_KEY!;
            const ai = new GoogleGenAI({ apiKey: Key });

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text }] }],
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: voiceName },
                        },
                    },
                },
            });

            const data: string = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "Sorry Some Error Occured";

            if (type === "base64url") {
                const audioBuffer = Buffer.from(data, 'base64');
                const base64Url = `data:audio/wav;base64,${audioBuffer}`;
                return base64Url;
            }

            if (type === "base64") {
                const audioBuffer = Buffer.from(data, 'base64');
                return audioBuffer;
            }
            await saveWaveFile(fileName.replace(/\.mp3$/, '.wav'), Buffer.from(data, 'base64'));
            return fileName.replace(/\.mp3$/, '.wav');
        } catch (err: any) {
            console.log(err);
            if (i === 4) { // If this is the last retry
                throw err; // Rethrow the error to provide better context
            }
        }
    }
    throw new Error("Failed to generate audio");
}
