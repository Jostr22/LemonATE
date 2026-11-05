import mongoose from 'mongoose';
import { DEFAULT_SETTINGS } from '../../../shared/catalog.js';

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'main' },
    brand: {
      name: { type: String, default: 'LemonATE' },
      slogan: { es: String, en: String },
      story: { es: String, en: String },
    },
    contact: {
      whatsapp: { type: String, default: '' },
      email: { type: String, default: '' },
      instagram: { type: String, default: '' },
      tiktok: { type: String, default: '' },
    },
    hours: {
      weekdays: { open: { type: String, default: '10:00' }, close: { type: String, default: '20:00' } },
      sunday: { open: { type: String, default: '10:00' }, close: { type: String, default: '16:00' } },
    },
    holidays: { type: [String], default: [] },
    delivery: {
      businessAddress: { type: String, default: '' },
      maxKm: { type: Number, default: 12 },
      ranges: {
        type: [{ maxKm: Number, fee: Number }],
        default: DEFAULT_SETTINGS.delivery.ranges,
      },
    },
    payments: {
      nequi: { type: String, default: '' },
      daviplata: { type: String, default: '' },
      bancolombia: { type: String, default: '' },
      breB: { type: String, default: '' },
      card: { type: String, default: 'Pago con tarjeta en modo demostración' },
    },
    coverage: { es: String, en: String },
  },
  { timestamps: true }
);

settingsSchema.statics.getMain = async function getMain() {
  let settings = await this.findOne({ key: 'main' });
  if (!settings) settings = await this.create({ key: 'main', ...DEFAULT_SETTINGS });
  return settings;
};

export const Settings = mongoose.model('Settings', settingsSchema);
