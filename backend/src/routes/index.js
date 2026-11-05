import { Router } from 'express';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import orderRoutes from './orders.js';
import messageRoutes from './messages.js';
import settingsRoutes from './settings.js';
import aiRoutes from './ai.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/messages', messageRoutes);
router.use('/settings', settingsRoutes);
router.use('/ai', aiRoutes);

export default router;
