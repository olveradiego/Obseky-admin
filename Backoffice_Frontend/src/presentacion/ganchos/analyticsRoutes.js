const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware'); // Asume que tienes estos middlewares
const analyticsService = require('../servicios/analyticsService');
const asyncHandler = require('../middleware/asyncHandler'); // Asume que tienes un asyncHandler para manejar errores en rutas async

// Ruta para obtener estadÃ­sticas de tarjetas
router.get(
  '/card-stats',
  protect,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  asyncHandler(async (req, res) => {
    const { companyName, startDate, endDate } = req.query;
    const stats = await analyticsService.getCardStatistics({ companyName, startDate, endDate });
    res.json(stats);
  })
);

// Ruta para obtener el resumen financiero
router.get(
  '/financial-summary',
  protect,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  asyncHandler(async (req, res) => {
    const { companyName, startDate, endDate } = req.query;
    const summary = await analyticsService.getFinancialSummary({ companyName, startDate, endDate });
    res.json(summary);
  })
);

// NUEVA: Ruta para obtener gastos por categorÃ­a
router.get(
  '/expenses-by-category',
  protect,
  authorize(['ADMIN', 'SUPER_ADMIN']),
  asyncHandler(async (req, res) => {
    const { companyName, startDate, endDate } = req.query;
    // NOTA: Como se mencionÃ³ en analyticsService, el filtrado por companyName para gastos
    // no es directamente compatible con el modelo Expense actual.
    // Si se necesita filtrar por compaÃ±Ã­a, se debe implementar una lÃ³gica para obtener
    // el companyId a partir del companyName y usarlo en el servicio.
    const expensesByCategory = await analyticsService.getExpensesByCategory({ companyName, startDate, endDate });
    res.json(expensesByCategory);
  })
);

module.exports = router;
