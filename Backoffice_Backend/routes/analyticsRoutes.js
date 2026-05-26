const express = require('express');
const router = express.Router();
const { protect, authorize } = require('@/middleware/authMiddleware');
const analyticsService = require('@/services/analyticsService');
const asyncHandler = require('@/middleware/asyncHandler'); // Asumiendo que asyncHandler se usa para las rutas

// Ruta para obtener estadísticas de tarjetas
router.get(
  '/card-stats',
  protect,
  authorize(['ADMIN', 'SUPER_ADMIN', 'Admin', 'SuperAdmin']), // Incluir posibles variaciones de roles
  asyncHandler(async (req, res) => {
    const { companyName } = req.query;
    const stats = await analyticsService.getCardStatistics(companyName);
    res.json(stats);
  })
);

// Ruta para obtener el resumen financiero
router.get(
  '/financial-summary',
  protect,
  authorize(['ADMIN', 'SUPER_ADMIN', 'Admin', 'SuperAdmin']), // Incluir posibles variaciones de roles
  asyncHandler(async (req, res) => {
    const { companyName, startDate, endDate } = req.query;
    const summary = await analyticsService.getFinancialSummary({ companyName, startDate, endDate });
    res.json(summary);
  })
);

// NUEVA: Ruta para obtener gastos por categoría
router.get(
  '/expenses-by-category',
  protect,
  authorize(['ADMIN', 'SUPER_ADMIN', 'Admin', 'SuperAdmin']), // Incluir posibles variaciones de roles
  asyncHandler(async (req, res) => {
    const { companyName, startDate, endDate } = req.query;
    // NOTA: Como se mencionó en analyticsService, el filtrado por companyName para gastos
    // no es directamente compatible con el modelo Expense actual.
    // Si se necesita filtrar por compañía, se debe implementar una lógica para obtener
    // el companyId a partir del companyName y usarlo en el servicio.
    const expensesByCategory = await analyticsService.getExpensesByCategory({ companyName, startDate, endDate });
    res.json(expensesByCategory);
  })
);

module.exports = router;