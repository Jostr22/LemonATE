import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', getSettings);
router.put('/', requireAuth, requireAdmin, updateSettings);

export default router;
