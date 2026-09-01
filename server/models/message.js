import mongoose from 'mongoose';
import { encrypt, decrypt } from '../utils/crypto.js';

const AuditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: ['CREATED', 'VIEWED', 'UPDATED', 'DECRYPTED'],
      default: 'VIEWED',
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const MessageSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, trim: true, default: 'Untitled Secret' },
    content: { type: String, required: [true, 'Secret content is required'] },
    category: {
      type: String,
      enum: ['Password', 'Note', 'API_Key', 'File_Link', 'Other'],
      default: 'Note',
    },
    auditLog: [AuditLogSchema],
    lastViewedAt: Date,
    lastViewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Pre-save hook: Encrypt content with AES-256-GCM before saving to MongoDB
MessageSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    // If not already in iv:authTag:ciphertext format, encrypt it
    const parts = (this.content || '').split(':');
    if (parts.length !== 3) {
      this.content = encrypt(this.content);
    }
  }
  next();
});

// Helper method to return decrypted content
MessageSchema.methods.getDecryptedContent = function () {
  return decrypt(this.content);
};

export default mongoose.model('Message', MessageSchema);
