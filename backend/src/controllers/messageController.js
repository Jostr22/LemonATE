import { Message } from '../models/Message.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createMessage = asyncHandler(async (req, res) => {
  const message = await Message.create(req.body);
  res.status(201).json({ ok: true, message: message.toObject() });
});

export const listMessages = asyncHandler(async (_req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 }).limit(200);
  res.json(messages);
});

export const markMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndUpdate(
    req.params.id,
    { status: 'leido' },
    { new: true }
  );
  if (!message) throw ApiError.notFound('Mensaje no encontrado.');
  res.json(message);
});
