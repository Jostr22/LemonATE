import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function readToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7);
}

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = readToken(req);
  if (!token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('La sesión expiró. Inicia sesión de nuevo.');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('La cuenta ya no existe.');

  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = readToken(req);
  if (!token) return next();
  try {
    const payload = verifyToken(token);
    req.user = await User.findById(payload.sub);
  } catch {
    req.user = null;
  }
  next();
});

export function requireAdmin(req, _res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(ApiError.forbidden('Se requiere una cuenta de administrador.'));
  }
  next();
}
