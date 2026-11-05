import { Router } from 'express';
import { chat } from '../controllers/aiController.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { chatSchema } from '../middleware/validators.js';
import { validateBody } from '../middleware/error.js';

const router = Router();

router.post('/chat', aiLimiter, validateBody(chatSchema), chat);

export default router;
