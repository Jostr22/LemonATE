import mongoose from 'mongoose';

const localized = {
  es: { type: String, required: true, trim: true, maxlength: 120 },
  en: { type: String, trim: true, default: '', maxlength: 120 },
};

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: {
      es: { ...localized.es },
      en: { ...localized.en, required: false },
    },
    description: {
      es: { type: String, trim: true, maxlength: 600, default: '' },
      en: { type: String, trim: true, maxlength: 600, default: '' },
    },
    category: {
      type: String,
      required: true,
      enum: ['limonadas', 'especiales', 'postres', 'combos'],
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, required: true, default: 'products/fotos/limonada-natural.webp' },
    customizable: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ 'name.es': 'text', 'name.en': 'text', tags: 'text' });

productSchema.methods.toPublic = function toPublic({ includeStock = false } = {}) {
  const availability = this.stock <= 0 ? 'soldout' : this.stock <= 5 ? 'low' : 'available';
  return {
    _id: this._id,
    slug: this.slug,
    name: this.name,
    description: this.description,
    category: this.category,
    price: this.price,
    availability,
    ...(includeStock ? { stock: this.stock } : {}),
    image: this.image,
    customizable: this.customizable,
    tags: this.tags,
    featured: this.featured,
    active: this.active,
  };
};

export const Product = mongoose.model('Product', productSchema);
