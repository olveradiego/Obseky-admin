// Archivo: middleware/errorHandler.js
// Proposito: middleware de Express para manejo de flujo HTTP y errores.

const { toAppError } = require("../lib/errorMapper");
const { notFoundError } = require("../lib/errorCatalog");

// Funcion 'notFoundMiddleware': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const notFoundMiddleware = (req, res, next) => {
  next(notFoundError("Ruta no encontrada", { path: req.originalUrl, method: req.method }));
};

// Funcion 'errorHandler': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const errorHandler = (error, req, res, _next) => {
  const normalized = toAppError(error);
  console.error(error); const status = normalized.statusCode || 500;
  const payload = {
    code: normalized.code || (status === 500 ? "INTERNAL_ERROR" : "UNKNOWN_ERROR"),
    message: normalized.message || "Error interno",
  };
  if (normalized.details !== undefined) payload.details = normalized.details;

  return res.status(status).json({
    backendError: payload,
    ...payload,
  });
};

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = {
  notFoundMiddleware,
  errorHandler,
};


