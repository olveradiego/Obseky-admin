// Archivo: middleware/asyncHandler.js
// Proposito: middleware de Express para manejo de flujo HTTP y errores.

// Funcion 'asyncHandler': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = asyncHandler;


