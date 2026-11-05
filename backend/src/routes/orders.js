import { Router } from 'express';
import {
  createOrder,
  listOrders,
  myOrders,
  trackOrder,
  updateStatus,
} from '../controllers/orderController.js';
import { optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.js';
import { orderSchema, statusSchema } from '../middleware/validators.js';
import { validateBody } from '../middleware/error.js';

const router = Router();

router.post('/', optionalAuth, validateBody(orderSchema), createOrder);
router.get('/track', trackOrder);
router.get('/mine', requireAuth, myOrders);
router.get('/', requireAuth, requireAdmin, listOrders);
router.patch('/:id/status', requireAuth, requireAdmin, validateBody(statusSchema), updateStatus);

export default router;
