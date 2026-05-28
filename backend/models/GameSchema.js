import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true, enum: ['Action', 'Racing', 'Adventure', 'Multiplayer', 'Puzzle'] },
    rating: { type: Number, default: 0 },
    players: { type: String, default: '1-4' },
    image: { type: String },
    description: { type: String },
    controlInstructions: { type: String },
    color: { type: String, default: 'cyan' },
    xpReward: { type: Number, default: 100 },
    iframeUrl: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    globalGame: { type: Boolean, default: true }, // if true, visible to all users
  },
  { timestamps: true }
);

export default mongoose.model('Game', gameSchema);
