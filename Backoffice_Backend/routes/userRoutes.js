// Archivo: routes/userRoutes.js
// Proposito: definicion de endpoints y mapeo hacia controladores.

const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", userController.list);
router.get("/:id", userController.getById);
router.post("/", userController.createOne);
router.patch("/:id", userController.updateById);
router.delete("/bulk", userController.deleteMany);
router.delete("/:id", userController.deleteById);

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = router;


