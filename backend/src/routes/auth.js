import { Router } from 'express';
import { login, me, register, updateMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { loginSchema, registerSchema, updateMeSchema } from '../middleware/validators.js';
import { validateBody } from '../middleware/error.js';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.get('/me', requireAuth, me);
router.patch('/me', requireAuth, validateBody(updateMeSchema), updateMe);

export default router;
