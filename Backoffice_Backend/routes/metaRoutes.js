// Archivo: routes/metaRoutes.js
// Proposito: definicion de endpoints y mapeo hacia controladores.

const express = require("express");
const { handleGetMeta } = require("../controllers/metaController");

const router = express.Router();

router.get("/", handleGetMeta);

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = router;


