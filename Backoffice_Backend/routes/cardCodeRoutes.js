// Archivo: routes/cardCodeRoutes.js
// Proposito: definicion de endpoints y mapeo hacia controladores.

const express = require("express");
// Controlador de cardcodes.
const cardCodeController = require("../controllers/cardCodeController");
// Servicio importado directamente para el endpoint de prueba.
const cardCodeService = require("../services/cardCodeService");

const router = express.Router();

// Endpoint para generar lotes de codigos con QR en memoria.
router.post("/generate/:numCodes/:purchaseType", cardCodeController.generateQrCodes);

// NUEVO ENDPOINT: Generar y descargar PDF enviando datos financieros en el Body.
router.post("/pdf", async (req, res, next) => {
  try {
    const { quantity, purchaseType, companyId, orderNumber, unitPrice, designId, frontendBaseUrl, pdfFormat } = req.body;

    const result = await cardCodeService.generateCodesPdf({
      num: parseInt(quantity, 10),
      purchaseType,
      companyId,
      orderNumber,
      unitPrice,
      designId,
      frontendBaseUrl,
      pdfFormat
    });

    res.setHeader("Content-Type", result.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    res.send(result.buffer);
  } catch (error) {
    next(error);
  }
});

// Endpoint para validar existencia/estado activo de una tarjeta.
router.get("/validate/:id", cardCodeController.validateCard);

// ENDPOINT DE PRUEBA: Generar N tarjetas con GET sin autenticación
// Uso: GET http://localhost:3002/api/admin/cardcodes/test-generate/30
router.get("/test-generate/:num", async (req, res, next) => {
  try {
    const num = parseInt(req.params.num, 10);
    const result = await cardCodeService.generateCodesPdf({
      num,
      purchaseType: true, // valor de prueba por defecto
      companyName: "Obseky", // IMPORTANTE: Debes tener una compañía con este nombre en tu BD
      orderNumber: `TEST-${Date.now()}`,
      unitPrice: 150.00
    });

    // Enviamos el PDF directamente como respuesta para que el navegador lo muestre o descargue
    res.setHeader("Content-Type", result.contentType);
    res.setHeader("Content-Disposition", `inline; filename="${result.filename}"`);
    res.send(result.buffer);
  } catch (error) {
    next(error); // Pasa el error al middleware global de manejo de errores
  }
});

// Endpoints CRUD del recurso codes/cardcodes.
router.get("/", cardCodeController.list);
router.get("/:id", cardCodeController.getById);
router.post("/", cardCodeController.createOne);
router.patch("/:id", cardCodeController.updateById);
router.delete("/bulk", cardCodeController.deleteMany);
router.delete("/:id", cardCodeController.deleteById);

// Exporta rutas REST de cardcodes.
module.exports = router;
