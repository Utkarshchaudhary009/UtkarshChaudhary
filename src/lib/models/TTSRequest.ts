import mongoose from 'mongoose';

const TTSRequestSchema = new mongoose.Schema({
    text: { type: String, required: true },
    voiceId: { type: String, required: true },
    cloudinaryUrl: { type: String },
    apiKeyName: { type: String },
    charactersUsed: { type: Number },
    durationMs: { type: Number },
    status: { type: String, enum: ['success', 'failed'], default: 'success' },
    error: { type: String },
    userId: { type: String }
}, { timestamps: true });

export const TTSRequests = mongoose.models.TTSRequests || mongoose.model('TTSRequests', TTSRequestSchema); 