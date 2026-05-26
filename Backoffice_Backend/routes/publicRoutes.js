// Archivo: routes/publicRoutes.js
// Proposito: definicion de endpoints publicos accesibles sin token JWT.

const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const validateCodeCard = require("../application/use-cases/codes/validateCodeCard");
const { buildItem } = require("../lib/responseBuilder");

const router = express.Router();

// GET /api/public/card/:id
// Valida que la tarjeta (CardCode) exista y este activa, sin requerir permisos de admin.
router.get("/card/:id", asyncHandler(async (req, res) => {
  const item = await validateCodeCard(req.params.id);
  // Devuelve la tarjeta para que el frontend pueda extraer los datos (folio, id, etc.)
  return res.status(200).json(buildItem(item, "Tarjeta válida"));
}));

module.exports = router;
