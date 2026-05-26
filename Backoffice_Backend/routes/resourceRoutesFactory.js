// Archivo: routes/resourceRoutesFactory.js
// Proposito: definicion de endpoints y mapeo hacia controladores.

const express = require("express");

// Funcion 'buildResourceRoutes': construye estructura/objeto estandar para respuestas o configuracion.
const buildResourceRoutes = (controller) => {
  const router = express.Router();

  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  router.post("/", controller.createOne);
  router.patch("/:id", controller.updateById);
  router.delete("/bulk", controller.deleteMany);
  router.delete("/:id", controller.deleteById);

  return router;
};

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = buildResourceRoutes;


