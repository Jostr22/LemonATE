import { asyncHandler } from '../utils/asyncHandler.js';
import { chat as chatService } from '../services/aiService.js';

export const chat = asyncHandler(async (req, res) => {
  const result = await chatService(req.body);
  res.json(result);
});
