import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  senderName: { type: String, required: true },
  text: { type: String, default: '' },
  mediaUrl: { type: String, default: '' },
  type: { type: String, enum: ['text', 'image', 'voice', 'file'], default: 'text' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Message', messageSchema);