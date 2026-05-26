// Archivo: lib/appError.js
// Proposito: utilidades transversales reutilizables (errores, authz, validaciones, respuestas).

class AppError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

// Funcion 'createError': crea un registro nuevo aplicando reglas/validaciones del flujo.
const createError = (statusCode, code, message, details) =>
  new AppError(statusCode, code, message, details);

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = {
  AppError,
  createError,
};


