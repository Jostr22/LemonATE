import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    contact: { type: String, required: true, trim: true, maxlength: 120 },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ['nuevo', 'leido'], default: 'nuevo' },
  },
  { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);
