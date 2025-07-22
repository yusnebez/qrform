import mongoose from 'mongoose';

const FanSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  lastAccess: { type: Date, default: null },
  lastEntry: { type: Date, default: null },
  lastExit: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.Fan || mongoose.model('Fan', FanSchema);
