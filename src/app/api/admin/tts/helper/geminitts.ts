// app/api/tts/route.ts
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
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

export async function GeminiTTS(apiKey: string, text: string, voiceName: string = "Zephyr", type: "mp3" | "base64url" | "base64" | "cloudinary" = "mp3", fileName: string = "test.mp3"): Promise<string | Buffer> {

    if (!apiKey && !process.env.GOOGLE_AI_KEY) {
        throw new Error("API key is required. Please provide an API key or set GEMINI_AI_KEY environment variable.");
    }
    console.log("API Key:", apiKey);
    console.log("Text:", text);
    console.log("Voice Name:", voiceName);
    console.log("Type:", type);
    console.log("File Name:", fileName);
    const Model = ["gemini-2.5-pro-preview-tts", "gemini-2.5-flash-preview-tts"]

    for (let i = 0; i < Model.length; i++) {
        console.log("Model:", Model[i]);
        try {

            let Key: string = apiKey || process.env.GEMINI_AI_KEY!;
            const ai = new GoogleGenAI({ apiKey: Key });

            const response = await ai.models.generateContent({
                model: Model[0],
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
            console.log("Data:", data);

            if (type === "base64url") {
                const audioBuffer = Buffer.from(data, 'base64');
                const base64Url = `data:audio/wav;base64,${audioBuffer}`;
                return base64Url;
            }

            if (type === "base64") {
                const audioBuffer = Buffer.from(data, 'base64')
                console.log("Audio Buffer:", audioBuffer);
                const base64 = audioBuffer.toString('base64');
                return base64;
            }

            if (type === "cloudinary") {
                // Return data URI format for direct Cloudinary upload
                return `data:audio/wav;base64,${data}`;
            }

            // Save to disk
            const outputDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
            const outputPath = path.join(outputDir, fileName.replace(/\.mp3$/, '.wav'));
            await saveWaveFile(outputPath, Buffer.from(data, 'base64'));
            console.log("Audio saved to:", outputPath);
            return outputPath;
        } catch (err: any) {
            console.log(err);
            throw err;
        }
    }
    throw new Error("All models failed");
}

