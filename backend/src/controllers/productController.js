import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/orderCode.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const listProducts = asyncHandler(async (req, res) => {
  const { category, q, featured } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (featured === 'true') filter.featured = true;
  if (req.query.includeInactive !== 'true') filter.active = { $ne: false };

  if (q) {
    const regex = new RegExp(escapeRegex(String(q)), 'i');
    filter.$or = [{ 'name.es': regex }, { 'name.en': regex }, { tags: regex }];
  }

  const products = await Product.find(filter).sort({ featured: -1, stock: -1, createdAt: 1 });
  res.json(products.map((product) => product.toPublic()));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || product.active === false) throw ApiError.notFound('Producto no encontrado.');
  res.json(product.toPublic());
});

async function uniqueSlug(base) {
  const clean = slugify(base) || `producto-${Date.now()}`;
  let slug = clean;
  let counter = 1;
  while (await Product.exists({ slug })) {
    slug = `${clean}-${counter++}`;
  }
  return slug;
}

export const createProduct = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  payload.slug = payload.slug ? slugify(payload.slug) : await uniqueSlug(payload.name?.es);
  if (await Product.exists({ slug: payload.slug })) {
    payload.slug = await uniqueSlug(payload.slug);
  }
  const product = await Product.create(payload);
  res.status(201).json(product.toPublic());
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Producto no encontrado.');

  const payload = { ...req.body };
  delete payload._id;
  delete payload.slug;

  Object.assign(product, payload);
  await product.save();
  res.json(product.toPublic());
});

export const removeProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { active: false },
    { new: true }
  );
  if (!product) throw ApiError.notFound('Producto no encontrado.');
  res.json({ ok: true, product: product.toPublic() });
});
