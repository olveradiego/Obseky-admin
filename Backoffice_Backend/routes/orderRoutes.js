// Archivo: routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('@/middleware/authMiddleware');
const asyncHandler = require('@/middleware/asyncHandler');
const orderService = require('@/services/orderService');

// Proteger todas las rutas de órdenes
router.use(protect);
router.use(authorize(['ADMIN', 'SUPER_ADMIN', 'Admin', 'SuperAdmin']));

// GET: Listar todas las órdenes (soporta ?paymentStatus=pending o ?companyId=...)
router.get('/', asyncHandler(async (req, res) => {
  const orders = await orderService.listOrders(req.query);
  res.json(orders);
}));

// GET: Obtener una orden por su ID
router.get('/:id', asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  res.json(order);
}));

// PATCH: Actualizar solo el estado de pago de la orden ('pending' o 'paid')
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, paymentStatus);
  res.json(order);
}));

// DELETE: Eliminar una orden (opcional para control estricto)
router.delete('/:id', asyncHandler(async (req, res) => {
  await orderService.deleteOrder(req.params.id);
  res.json({ message: 'Orden eliminada correctamente' });
}));

module.exports = router;