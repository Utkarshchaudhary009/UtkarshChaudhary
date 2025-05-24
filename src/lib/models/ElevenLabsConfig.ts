import mongoose from 'mongoose';

const ElevenLabsConfigSchema = new mongoose.Schema({
    defaultVoiceId: { type: String, required: true },
    fallbackVoiceId: { type: String },
    voiceSettings: {
        stability: { type: Number, default: 0.3 },
        similarity_boost: { type: Number, default: 0.75 }
    },
    rotationStrategy: { type: String, default: 'least-used' },
    cloudinaryFolder: { type: String, default: 'TTS_Audio' }
}, { _id: false });

export const ElevenLabsConfigs = mongoose.models.ElevenLabsConfigs || mongoose.model('ElevenLabsConfigs', new mongoose.Schema({
    config: ElevenLabsConfigSchema
}, { timestamps: true })); 