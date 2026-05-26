// Archivo: controllers/metaController.js
// Proposito: controlador HTTP; transforma request/response y delega la logica de negocio.

const asyncHandler = require("../middleware/asyncHandler");
const { getMeta } = require("../services/metaService");

// Funcion 'handleGetMeta': maneja una solicitud HTTP y coordina la respuesta del endpoint.
const handleGetMeta = asyncHandler(async (req, res) => {
  const item = await getMeta({ authorizationHeader: req.headers.authorization });
  return res.status(200).json(item);
});

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = {
  handleGetMeta,
};


