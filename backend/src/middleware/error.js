import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';

/** Valida req.body con un esquema Zod. */
export const validateBody = (schema) => (req, _res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(ApiError.badRequest('Revisa los datos enviados.', errors));
    }
    next(error);
  }
};

export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

export function errorHandler(error, _req, res, _next) {
  let status = error.status || 500;
  let message = error.message || 'Error interno del servidor.';
  let errors = error.errors;

  if (error.name === 'ValidationError') {
    status = 400;
    message = 'Datos inválidos.';
    errors = Object.values(error.errors).map((item) => ({ field: item.path, message: item.message }));
  }

  if (error.name === 'CastError') {
    status = 400;
    message = 'Identificador inválido.';
  }

  if (error.code === 11000) {
    status = 409;
    const field = Object.keys(error.keyValue || {})[0] || 'campo';
    message = `Ya existe un registro con ese ${field}.`;
  }

  if (error.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Token inválido.';
  }

  if (status >= 500) {
    console.error('[lemonate] Error:', error);
  }

  res.status(status).json({
    message,
    ...(errors ? { errors } : {}),
  });
}
