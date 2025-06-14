import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema({
  characterId: { type: String, required: true },
  characterName: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

export const GameSession = mongoose.model('GameSession', gameSessionSchema); 