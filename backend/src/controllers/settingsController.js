import { Settings } from '../models/Settings.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const EDITABLE = [
  'brand',
  'founder',
  'contact',
  'hours',
  'holidays',
  'delivery',
  'payments',
  'coverage',
];

export const getSettings = asyncHandler(async (_req, res) => {
  const settings = await Settings.getMain();
  res.json(settings);
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getMain();

  for (const field of EDITABLE) {
    if (req.body[field] !== undefined) {
      settings[field] = { ...(settings[field]?.toObject?.() || settings[field] || {}), ...req.body[field] };
    }
  }

  await settings.save();
  res.json(settings);
});
