import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(uri = env.mongoUri) {
  if (!uri) {
    throw new Error('MONGODB_URI no está definida. Revisa el archivo .env del backend.');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 12000,
  });
  console.log(`[lemonate] MongoDB conectado: ${mongoose.connection.name}`);
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
