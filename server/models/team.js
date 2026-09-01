import mongoose from 'mongoose';
import crypto from 'crypto';

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Team name required'], trim: true },
    description: { type: String, default: '', trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    joinCode: {
      type: String,
      unique: true,
      index: true,
      default: () => crypto.randomBytes(4).toString('hex').toUpperCase(),
    },
  },
  { timestamps: true }
);

// Fallback to ensure joinCode is generated if not set
TeamSchema.pre('save', function (next) {
  if (!this.joinCode) {
    this.joinCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  next();
});

export default mongoose.model('Team', TeamSchema);
