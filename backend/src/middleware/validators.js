import { z } from 'zod';

const localized = (max = 600) =>
  z.object({
    es: z.string().trim().min(1, 'El texto en español es obligatorio').max(max),
    en: z.string().trim().max(max).optional().default(''),
  });

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Escribe tu nombre').max(80),
  email: z.string().trim().email('Correo inválido').toLowerCase(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
  phone: z.string().trim().max(30).optional().default(''),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Correo inválido').toLowerCase(),
  password: z.string().min(1, 'Escribe tu contraseña').max(72),
});

export const updateMeSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(30).optional(),
  addresses: z
    .array(
      z.object({
        label: z.string().trim().max(40).optional().default(''),
        line: z.string().trim().min(4, 'Escribe la dirección').max(160),
        neighborhood: z.string().trim().max(80).optional().default(''),
        notes: z.string().trim().max(240).optional().default(''),
        distanceKm: z.coerce.number().min(0).max(60).optional().default(0),
      })
    )
    .max(10)
    .optional(),
  favorites: z.array(z.string()).max(100).optional(),
});

export const productSchema = z.object({
  slug: z.string().trim().max(80).optional(),
  name: localized(120),
  description: localized(600).optional(),
  category: z.enum(['limonadas', 'especiales', 'postres', 'combos']),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo').max(10000000),
  stock: z.coerce.number().int().min(0, 'Las existencias no pueden ser negativas').max(100000),
  image: z.string().trim().min(1).max(400),
  customizable: z.coerce.boolean().optional().default(false),
  tags: z.array(z.string().trim().max(30)).max(12).optional().default([]),
  featured: z.coerce.boolean().optional().default(false),
  active: z.coerce.boolean().optional().default(true),
});

export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        qty: z.coerce.number().int().min(1).max(99),
        customization: z
          .object({
            size: z.enum(['small', 'medium', 'large']).optional(),
            ice: z.enum(['none', 'light', 'normal']).optional(),
            sugar: z.enum(['none', 'less', 'normal']).optional(),
            extras: z.array(z.string()).max(8).optional(),
          })
          .optional()
          .default({}),
      })
    )
    .min(1, 'El carrito está vacío')
    .max(40),
  customer: z.object({
    name: z.string().trim().min(2, 'Escribe el nombre').max(80),
    phone: z.string().trim().min(7, 'Escribe un teléfono válido').max(30),
    email: z.string().trim().email('Correo inválido').max(120).optional().or(z.literal('')),
  }),
  address: z.object({
    line: z.string().trim().min(4, 'Escribe la dirección').max(160),
    neighborhood: z.string().trim().max(80).optional().default(''),
    notes: z.string().trim().max(240).optional().default(''),
    distanceKm: z.coerce.number().min(0).max(60),
  }),
  paymentMethod: z.enum(['nequi', 'daviplata', 'bancolombia', 'bre-b', 'tarjeta']),
  discount: z.coerce.number().min(0).max(1000000).optional().default(0),
});

export const messageSchema = z.object({
  name: z.string().trim().min(2, 'Escribe tu nombre').max(80),
  contact: z.string().trim().min(5, 'Escribe un teléfono o correo').max(120),
  subject: z.string().trim().min(3, 'Escribe un asunto').max(120),
  message: z.string().trim().min(10, 'El mensaje debe tener al menos 10 caracteres').max(2000),
});

export const chatSchema = z.object({
  message: z.string().trim().min(1, 'Escribe una pregunta').max(300),
  lang: z.enum(['es', 'en']).optional().default('es'),
});

export const statusSchema = z.object({
  status: z.enum([
    'recibido',
    'pago-pendiente',
    'pago-confirmado',
    'en-preparacion',
    'en-camino',
    'entregado',
    'cancelado',
  ]),
});
