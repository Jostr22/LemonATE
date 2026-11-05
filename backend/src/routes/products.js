import { Router } from 'express';
import {
  createProduct,
  getProduct,
  listProducts,
  removeProduct,
  updateProduct,
} from '../controllers/productController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { productSchema } from '../middleware/validators.js';
import { validateBody } from '../middleware/error.js';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProduct);

router.post('/', requireAuth, requireAdmin, validateBody(productSchema), createProduct);
router.patch(
  '/:id',
  requireAuth,
  requireAdmin,
  validateBody(productSchema.partial()),
  updateProduct
);
router.delete('/:id', requireAuth, requireAdmin, removeProduct);

export default router;
