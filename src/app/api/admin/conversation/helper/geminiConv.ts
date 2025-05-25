import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import wav from 'wav';

/**
 * Saves raw PCM data to a .wav file using WAV format.
 */
async function saveWaveFile(
    filename: string,
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2,
): Promise<void> {
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

/**
 * Converts a given `text` into speech audio using Gemini TTS.
 * Returns a local file path of the generated `.wav` file.
 */
export async function GeminiTTS(
    apiKey: string,
    text: string,
    voiceMap: { [k: string]: string; },
    format: 'mp3' | 'wav' = 'wav',
    fileName: string = `TTS_Output.wav`
): Promise<string> {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = text;
    const voices = Object.values(voiceMap);
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: voices.map(voice => ({
                        speaker: voice,
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: voice }
                        }
                    }))
                }
            }
        } as any
    });

    const base64Data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Data) {
        throw new Error("Failed to retrieve audio data from Gemini.");
    }

    const audioBuffer = Buffer.from(base64Data, 'base64');

    // Save to disk
    const outputDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    const outputPath = path.join(outputDir, fileName.replace(/\.mp3$/, '.wav'));

    await saveWaveFile(outputPath, audioBuffer);

    return outputPath;
}
