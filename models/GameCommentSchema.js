import mongoose from 'mongoose';

const gameCommentSchema = new mongoose.Schema(
  {
    gameId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('GameComment', gameCommentSchema);
