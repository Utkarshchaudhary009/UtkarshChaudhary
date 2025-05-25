// app/api/tts/route.ts
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';


export async function Mp3Writer(data: string, fileName: string) {
    const audioBuffer = Buffer.from(data, 'base64');
    const dir = path.join(process.cwd(), 'public', 'audio');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, audioBuffer);
    return filePath;
}

const errorBuffer: Buffer = Buffer.from("Sorry Some Error Occured");

export async function GeminiTTS(apiKey: string, text: string, voiceName: string = "Zephyr", type: "mp3" | "base64url" | "base64" = "mp3", fileName: string = "test.mp3") {

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
                const base64Url = `data:audio/wav;base64,${audioBuffer.toString('base64')}`;
                return base64Url;
            }

            if (type === "base64") {
                const audioBuffer = Buffer.from(data, 'base64');
                return audioBuffer;
            }
            const path = await Mp3Writer(data, fileName);
            return path;
        } catch (err: any) {
            console.log(err);
            if (i === 4) { // If this is the last retry
                throw err; // Rethrow the error to provide better context
            }
        }
    }
    throw new Error("Failed to generate audio");
}
