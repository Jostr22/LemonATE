import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: '' },
    line: { type: String, required: true, trim: true },
    neighborhood: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    distanceKm: { type: Number, min: 0, default: 0 },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Correo inválido'],
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    phone: { type: String, trim: true, default: '' },
    addresses: { type: [addressSchema], default: [] },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function toPublic() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    addresses: this.addresses,
    favorites: this.favorites,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
