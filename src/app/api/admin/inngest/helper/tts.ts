import { GeminiTTS } from '@/app/api/admin/inngest/helper/geminitts';
import { connectDB } from '@/lib/db';
import { ElevenLabsConfigs } from '@/lib/models/ElevenLabsConfig';
import { ElevenLabsKeys } from '@/lib/models/ElevenLabsKey';
import { TTSRequests } from '@/lib/models/TTSRequest';
import { v2 as cloudinary } from 'cloudinary';
type TTSResult =
    | { success: false, error: string, message?: string, details?: string[] }
    | {
        success: true,
        audioUrl: string,
        voiceId: string,
        usedKey: string,
        charactersUsed: number,
        durationMs: number
    };
/**
 * Cloudinary configuration for audio storage
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!
});

/**
 * Text-to-Speech API endpoint
 * 
 * Converts text to audio using available TTS services
 * and uploads the result to Cloudinary
 */
export async function TTS(text: string, title: string): Promise<TTSResult> {
    try {
        await connectDB();

        // Extract and validate request data
        if (!text) {
            return { success: false, error: 'Text is required' };
        }

        const charactersNeeded = text.length;

        // Get configuration settings
        const configDoc = await ElevenLabsConfigs.findOne();
        const config = configDoc?.config || {};
        const voiceId = config.defaultVoiceId || 'EXAVITQu4vr4xnSDxMaL';

        if (!voiceId) {
            return { success: false, error: 'No default voice ID configured' };
        }

        // Find available API keys with sufficient quota
        const keys = await ElevenLabsKeys.find({ enabled: true }).sort({
            lastUsedAt: 1          // oldest used first
        });

        if (!keys.length) {
            return { success: false, error: 'No active API keys available' };
        }

        // Process with available keys
        let successfulKey = null;
        let audioData: string | null | Buffer<ArrayBufferLike> = null;
        let errorLog: string[] = [];
        const startTime = Date.now();

        for (const keyDoc of keys) {
            try {
                // Check if key has sufficient character quota
                const remaining = keyDoc.characterLimit - keyDoc.usedCharacters;
                if (remaining < charactersNeeded) continue;

                // Generate audio using Gemini TTS with cloudinary option
                audioData = await GeminiTTS(keyDoc.key, text, voiceId, "wav", `TTS_${title ? title : "test"}.wav`);
                successfulKey = keyDoc;

                if (audioData) break; // Successfully generated audio
            } catch (error: any) {
                errorLog.push(`Key "${keyDoc.name}" failed: ${error.message}`);
                continue; // Try next key
            }
        }

        // Handle case where no key succeeded
        if (!successfulKey || !audioData) {
            await TTSRequests.create({
                text,
                voiceId,
                status: 'failed',
                error: 'All keys failed or quota exceeded',
                apiKeyName: 'ALL_TRIED',
                charactersUsed: charactersNeeded
            });

            return {
                success: false,
                error: 'All TTS service keys failed',
                details: errorLog
            };
        }

        try {
            // Generate unique filename for the audio
            const fileName = `TTS_${title ? title : "test"}.wav`;

            // Upload audio to Cloudinary directly from base64
            const upload = await cloudinary.uploader.upload(audioData as string, {
                resource_type: 'video',
                folder: config.cloudinaryFolder || 'TTS_Audio',
                public_id: fileName.replace('.wav', '')
            });

            const cloudinaryUrl = upload.secure_url;
            const durationMs = Date.now() - startTime;

            // Log successful request
            await TTSRequests.create({
                text,
                voiceId,
                cloudinaryUrl,
                apiKeyName: successfulKey.name,
                charactersUsed: charactersNeeded,
                durationMs,
                status: 'success',
                userId: 'admin' // Replace with actual user ID in production
            });

            // Update key usage statistics
            await ElevenLabsKeys.findByIdAndUpdate(successfulKey._id, {
                $inc: { usedCharacters: charactersNeeded },
                lastUsedAt: new Date()
            });

            // Return success response with audio URL
            return {
                audioUrl: cloudinaryUrl,
                success: true,
                voiceId,
                usedKey: successfulKey.name,
                charactersUsed: charactersNeeded,
                durationMs
            };

        } catch (cloudErr: any) {
            // Log failed upload
            await TTSRequests.create({
                text,
                voiceId,
                status: 'failed',
                apiKeyName: successfulKey.name,
                charactersUsed: charactersNeeded,
                error: 'Cloudinary upload failed'
            });

            return {
                success: false,
                error: 'Cloudinary upload failed',
                message: cloudErr.message
            };
        }
    } catch (error: any) {
        // Handle unexpected errors
        return {
            success: false,
            error: 'Internal server error',
            message: error.message
        };
    }
}
