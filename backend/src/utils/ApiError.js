export class ApiError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.isOperational = true;
  }

  static badRequest(message, errors) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Debes iniciar sesión.') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'No tienes permisos para esta acción.') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Recurso no encontrado.') {
    return new ApiError(404, message);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }
}
