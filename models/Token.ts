import mongoose from 'mongoose';

const TokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  created: { type: Date, default: Date.now },
  used: { type: Boolean, default: false },
  categoria: {
    type: String,
    enum: ['Tercera', 'Sub 23', 'División de honor'],
    required: false,
    default: undefined
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from creation
    index: { expires: '0' }, // TTL index to automatically delete expired tokens
  },
});

export default mongoose.models.Token || mongoose.model('Token', TokenSchema);
