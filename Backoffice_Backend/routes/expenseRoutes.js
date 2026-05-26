// Archivo: routes/expenseRoutes.js
// Proposito: Define las rutas para la gestión de gastos.

const express = require("express");
const router = express.Router();
const expenseService = require("../services/expenseService");
const asyncHandler = require("../middleware/asyncHandler");
const { protect, authorize } = require("../middleware/authMiddleware");

// Middleware de autorización para gastos (ej. solo SUPER_ADMIN y ADMIN pueden gestionar gastos)
const authorizeExpenseManagement = authorize(["SUPER_ADMIN", "ADMIN", "SuperAdmin", "Admin"]);

// @route   GET /api/admin/expenses
// @desc    Obtener todos los gastos (con filtros opcionales)
// @access  Private (SUPER_ADMIN, ADMIN)
router.get(
  "/",
  protect,
  authorizeExpenseManagement,
  asyncHandler(async (req, res) => {
    const expenses = await expenseService.listExpenses(req.query);
    res.status(200).json(expenses);
  })
);

// @route   GET /api/admin/expenses/:id
// @desc    Obtener un gasto por ID
// @access  Private (SUPER_ADMIN, ADMIN)
router.get(
  "/:id",
  protect,
  authorizeExpenseManagement,
  asyncHandler(async (req, res) => {
    const expense = await expenseService.getExpenseById(req.params.id);
    res.status(200).json(expense);
  })
);

// @route   POST /api/admin/expenses
// @desc    Crear un nuevo gasto
// @access  Private (SUPER_ADMIN, ADMIN)
router.post(
  "/",
  protect,
  authorizeExpenseManagement,
  asyncHandler(async (req, res) => {
    const newExpense = await expenseService.createExpense(req.body);
    res.status(201).json(newExpense);
  })
);

// @route   PATCH /api/admin/expenses/:id
// @desc    Actualizar un gasto existente
// @access  Private (SUPER_ADMIN, ADMIN)
router.patch(
  "/:id",
  protect,
  authorizeExpenseManagement,
  asyncHandler(async (req, res) => {
    const updatedExpense = await expenseService.updateExpense(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedExpense);
  })
);

// @route   DELETE /api/admin/expenses/:id
// @desc    Eliminar un gasto
// @access  Private (SUPER_ADMIN, ADMIN)
router.delete(
  "/:id",
  protect,
  authorizeExpenseManagement,
  asyncHandler(async (req, res) => {
    await expenseService.deleteExpense(req.params.id);
    res.status(200).json({ message: "Gasto eliminado correctamente" });
  })
);

module.exports = router;