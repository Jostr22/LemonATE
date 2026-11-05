import { Router } from 'express';
import { createMessage, listMessages, markMessage } from '../controllers/messageController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { formLimiter } from '../middleware/rateLimit.js';
import { messageSchema } from '../middleware/validators.js';
import { validateBody } from '../middleware/error.js';

const router = Router();

router.post('/', formLimiter, validateBody(messageSchema), createMessage);
router.get('/', requireAuth, requireAdmin, listMessages);
router.patch('/:id', requireAuth, requireAdmin, markMessage);

export default router;
