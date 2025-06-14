import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  level: { type: Number, required: true },
  hp: { type: Number, required: true },
  damage: { type: Number, required: true },
  armor: { type: Number, required: true },
  magicResistance: { type: Number, required: true },
  criticalChance: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, required: true }
}, {
  timestamps: true
});

export const Character = mongoose.model('Character', characterSchema); 