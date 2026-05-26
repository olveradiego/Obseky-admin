// Archivo: lib/errorCatalog.js
// Proposito: utilidades transversales reutilizables (errores, authz, validaciones, respuestas).

const { createError } = require("./appError");

// Funcion 'validationError': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const validationError = (message, details) =>
  createError(400, "VALIDATION_ERROR", message, details);

// Funcion 'unauthorizedError': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const unauthorizedError = (message = "Token ausente o invalido", details) =>
  createError(401, "UNAUTHORIZED", message, details);

// Funcion 'forbiddenError': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const forbiddenError = (message = "No autorizado", details) =>
  createError(403, "FORBIDDEN", message, details);

// Funcion 'notFoundError': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const notFoundError = (message, details) =>
  createError(404, "NOT_FOUND", message, details);

// Funcion 'conflictError': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const conflictError = (message, details) =>
  createError(409, "CONFLICT", message, details);

// Funcion 'internalError': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const internalError = (message = "Error interno", details) =>
  createError(500, "INTERNAL_ERROR", message, details);

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = {
  validationError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
  conflictError,
  internalError,
};


