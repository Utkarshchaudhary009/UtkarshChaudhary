import { GoogleGenAI } from '@google/genai';
import path from 'path';
import wav from 'wav';
// // To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

// import {
//     GoogleGenAI,
//   } from '@google/genai';
//   import mime from 'mime';
//   import { writeFile } from 'fs';

//   function saveBinaryFile(fileName: string, content: Buffer) {
//     writeFile(fileName, content, 'utf8', (err) => {
//       if (err) {
//         console.error(`Error writing file ${fileName}:`, err);
//         return;
//       }
//       console.log(`File ${fileName} saved to file system.`);
//     });
//   }

//   async function main() {
//     const ai = new GoogleGenAI({
//       apiKey: process.env.GEMINI_API_KEY,
//     });
//     const config = {
//       temperature: 1,
//       responseModalities: [
//           'audio',
//       ],
//       multiSpeakerVoiceConfig: {
//         speakerVoiceConfigs: [
//           {
//             speaker: "Speaker 1",
//             voiceConfig: {
//               prebuiltVoiceConfig: {
//                 voiceName: "Zephyr"
//               }
//             }
//           },
//           {
//             speaker: "Speaker 2",
//             voiceConfig: {
//               prebuiltVoiceConfig: {
//                 voiceName: "Puck"
//               }
//             }
//           },
//         ]
//       },
//     };
//     const model = 'gemini-2.5-flash-preview-tts';
//     const contents = [
//       {
//         role: 'user',
//         parts: [
//           {
//             text: `Read aloud in a warm, welcoming tone
//   Speaker 1: Hello! We're excited to show you our native speech capabilities
//   Speaker 2: Where you can direct a voice, create realistic dialog, and so much more. Edit these placeholders to get started.`,
//           },
//         ],
//       },
//     ];

//     const response = await ai.models.generateContentStream({
//       model,
//       config,
//       contents,
//     });
//     for await (const chunk of response) {
//       if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
//         continue;
//       }
//       if (chunk.candidates[0].content.parts[0].inlineData) {
//         const fileName = 'ENTER_FILE_NAME';
//         const inlineData = chunk.candidates[0].content.parts[0].inlineData;
//         let fileExtension = mime.getExtension(inlineData.mimeType || '');
//         let buffer = Buffer.from(inlineData.data || '', 'base64');
//         if (!fileExtension) {
//           fileExtension = 'wav';
//           buffer = convertToWav(inlineData.data || '', inlineData.mimeType || '');
//         }
//         saveBinaryFile(`${fileName}.${fileExtension}`, buffer);
//       }
//       else {
//         console.log(chunk.text);
//       }
//     }
//   }

//   main();

//   interface WavConversionOptions {
//     numChannels : number,
//     sampleRate: number,
//     bitsPerSample: number
//   }

//   function convertToWav(rawData: string, mimeType: string) {
//     const options = parseMimeType(mimeType)
//     const wavHeader = createWavHeader(rawData.length, options);
//     const buffer = Buffer.from(rawData, 'base64');

//     return Buffer.concat([wavHeader, buffer]);
//   }

//   function parseMimeType(mimeType : string) {
//     const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
//     const [_, format] = fileType.split('/');

//     const options : Partial<WavConversionOptions> = {
//       numChannels: 1,
//     };

//     if (format && format.startsWith('L')) {
//       const bits = parseInt(format.slice(1), 10);
//       if (!isNaN(bits)) {
//         options.bitsPerSample = bits;
//       }
//     }

//     for (const param of params) {
//       const [key, value] = param.split('=').map(s => s.trim());
//       if (key === 'rate') {
//         options.sampleRate = parseInt(value, 10);
//       }
//     }

//     return options as WavConversionOptions;
//   }

//   function createWavHeader(dataLength: number, options: WavConversionOptions) {
//     const {
//       numChannels,
//       sampleRate,
//       bitsPerSample,
//     } = options;

//     // http://soundfile.sapp.org/doc/WaveFormat

//     const byteRate = sampleRate * numChannels * bitsPerSample / 8;
//     const blockAlign = numChannels * bitsPerSample / 8;
//     const buffer = Buffer.alloc(44);

//     buffer.write('RIFF', 0);                      // ChunkID
//     buffer.writeUInt32LE(36 + dataLength, 4);     // ChunkSize
//     buffer.write('WAVE', 8);                      // Format
//     buffer.write('fmt ', 12);                     // Subchunk1ID
//     buffer.writeUInt32LE(16, 16);                 // Subchunk1Size (PCM)
//     buffer.writeUInt16LE(1, 20);                  // AudioFormat (1 = PCM)
//     buffer.writeUInt16LE(numChannels, 22);        // NumChannels
//     buffer.writeUInt32LE(sampleRate, 24);         // SampleRate
//     buffer.writeUInt32LE(byteRate, 28);           // ByteRate
//     buffer.writeUInt16LE(blockAlign, 32);         // BlockAlign
//     buffer.writeUInt16LE(bitsPerSample, 34);      // BitsPerSample
//     buffer.write('data', 36);                     // Subchunk2ID
//     buffer.writeUInt32LE(dataLength, 40);         // Subchunk2Size

//     return buffer;
//   }

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
            responseModalities: ['audio'],
            multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: voices.map(voice => ({
                    speaker: voice,
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice }
                    }
                }))
            }
        } as any
    });

    const base64Data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Data) {
        throw new Error("Failed to retrieve audio data from Gemini.");
    }

    const audioBuffer = Buffer.from(base64Data, 'base64');

    // Save to disk using /tmp directory for serverless functions
    const outputDir = '/tmp';
    const outputPath = path.join(outputDir, fileName.replace(/\.wav$/, '.wav'));

    await saveWaveFile(outputPath, audioBuffer);

    return outputPath;
}
