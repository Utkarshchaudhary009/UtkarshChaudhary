import { connectDB } from '@/lib/db';
import { GeminiTTS } from '@/lib/inngest/helper/geminiConv';
import { ElevenLabsConfigs } from '@/lib/models/ElevenLabsConfig';
import { ElevenLabsKeys } from '@/lib/models/ElevenLabsKey';
import { TTSRequests } from '@/lib/models/TTSRequest';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary configuration for audio storage
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!
});

/**
 * Process a conversation TTS request
 * 
 * @param speakers Array of speakers with their voice names
 * @param content Array of text content with speaker assignments
 * @param inngestJobId Optional job ID for tracking
 * @returns Result object with success/error information
 */
export async function processConversationTTS(
    speakers: { name: string, voiceName: string }[],
    content: { speakerName: string, text: string }[],
    fileId: string
) {
    try {
        await connectDB();

        // Validate input
        if (!speakers?.length || !content?.length) {
            return { error: 'Missing required speaker or content data' };
        }

        const configDoc = await ElevenLabsConfigs.findOne();
        const config = configDoc?.config || {};
        const folder = config.cloudinaryFolder || 'TTS_Audio';

        const fullText = content.map(c => `${c.speakerName}: ${c.text}`).join('\n');
        const charactersNeeded = fullText.length;

        // Find available API keys with sufficient quota
        const keys = await ElevenLabsKeys.find({ enabled: true }).sort({
            usedCharacters: 1,
            lastUsedAt: 1
        });

        if (!keys.length) {
            await logRequest({
                text: fullText,
                status: 'failed',
                error: 'No active TTS keys available'
            });

            return { error: 'No active TTS keys available' };
        }

        // Try keys until one succeeds
        let successKey = null;
        let audioPath: string | null | Buffer = null;
        const startTime = Date.now();
        const errors: string[] = [];

        for (const key of keys) {
            if (key.characterLimit - key.usedCharacters < charactersNeeded) continue;

            try {
                // Map speakers to their voice names for GeminiTTS
                const voiceMap = Object.fromEntries(speakers.map(s => [s.name, s.voiceName]));
                const filename = `TTS_MultiSpeaker_${fileId}}.wav`;

                audioPath = await GeminiTTS(key.key, fullText, voiceMap, 'wav', filename);
                successKey = key;

                if (audioPath) break;
            } catch (err: any) {
                errors.push(`Key ${key.name} failed: ${err.message}`);
            }
        }

        // Handle case where no key succeeded
        if (!audioPath || !successKey) {
            await logRequest({
                text: fullText,
                status: 'failed',
                error: 'All keys failed or quota exceeded',
                apiKeyName: 'ALL',
                charactersUsed: charactersNeeded
            });

            return {
                error: 'All TTS service keys failed',
                details: errors
            };
        }

        // Upload to Cloudinary
        try {
            const upload = await cloudinary.uploader.upload(audioPath as string, {
                resource_type: 'video',
                folder,
                public_id: `TTS_MultiSpeaker_${fileId}`
            });

            const duration = Date.now() - startTime;
            const url = upload.secure_url;

            // Log successful request
            await logRequest({
                text: fullText,
                voiceId: 'multi',
                cloudinaryUrl: url,
                apiKeyName: successKey.name,
                charactersUsed: charactersNeeded,
                durationMs: duration,
                status: 'success',
                userId: 'admin'
            });

            // Update key usage statistics
            await ElevenLabsKeys.findByIdAndUpdate(successKey._id, {
                $inc: { usedCharacters: charactersNeeded },
                lastUsedAt: new Date()
            });

            return {
                success: true,
                audioUrl: url,
                duration,
                charactersUsed: charactersNeeded
            };

        } catch (cloudErr: any) {
            await logRequest({
                text: fullText,
                voiceId: 'multi',
                status: 'failed',
                error: 'Cloudinary upload failed',
                apiKeyName: successKey.name,
                charactersUsed: charactersNeeded
            });

            return {
                error: 'Cloudinary upload failed',
                message: cloudErr.message
            };
        }
    } catch (err: any) {
        return {
            error: 'Server error',
            message: err.message
        };
    }
}

/**
 * Helper function to log TTS request to database
 */
async function logRequest(data: {
    text: string;
    voiceId?: string;
    cloudinaryUrl?: string;
    apiKeyName?: string;
    charactersUsed?: number;
    durationMs?: number;
    status: 'success' | 'failed';
    error?: string;
    userId?: string;
}) {
    try {
        return await TTSRequests.create(data);
    } catch (error) {
        console.error('Failed to log TTS request:', error);
    }
} 