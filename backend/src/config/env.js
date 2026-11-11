import 'dotenv/config';

const required = ['MONGODB_URI', 'JWT_SECRET'];

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpires: process.env.JWT_EXPIRES || '7d',
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  admin: {
    name: process.env.ADMIN_NAME || 'Administrador LemonATE',
    email: process.env.ADMIN_EMAIL || 'admin@lemonate.com',
    password: process.env.ADMIN_PASSWORD || 'LemonATE2026',
  },
  notifications: {
    ownerEmail: process.env.OWNER_NOTIFICATION_EMAIL || 'amilkar0322@gmail.com',
    resendApiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.NOTIFICATION_FROM_EMAIL || 'LemonATE <onboarding@resend.dev>',
  },
  paymentsMode: process.env.PAYMENTS_MODE || 'demo',
};

export function assertEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno: ${missing.join(', ')}. Copia .env.example a .env y complétalas.`
    );
  }
  if (env.jwtSecret.length < 24) {
    throw new Error('JWT_SECRET debe tener al menos 24 caracteres.');
  }
  if (env.nodeEnv === 'production' && env.admin.password === 'LemonATE2026') {
    console.warn('[lemonate] ADVERTENCIA: cambia la contraseña del administrador antes de publicar.');
  }
}
