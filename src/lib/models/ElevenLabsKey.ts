import mongoose from 'mongoose';

const ElevenLabsKeySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    key: { type: String, required: true },
    usedCharacters: { type: Number, default: 0 },
    characterLimit: { type: Number, default: 10000 },
    enabled: { type: Boolean, default: true },
    lastCheckedAt: { type: Date },
    lastUsedAt: { type: Date },
    notes: { type: String },
    tier: { type: String, enum: ['free', 'pro', 'team'], default: 'free' }
}, { timestamps: true });

export const ElevenLabsKey = mongoose.models.ElevenLabsKey || mongoose.model('ElevenLabsKey', ElevenLabsKeySchema); 