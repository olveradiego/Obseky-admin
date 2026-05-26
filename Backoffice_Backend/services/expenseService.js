// Archivo: services/expenseService.js
// Proposito: Capa de servicio para la lógica de negocio de gastos.

const Expense = require("@/models/Expense");
const { validationError, notFoundError } = require("@/lib/errorCatalog");

/**
 * Obtiene todos los gastos, con opciones de filtrado.
 * @param {object} filters - Objeto con filtros (ej. { companyId, startDate, endDate, category }).
 * @returns {Promise<Array<object>>} Lista de gastos.
 */
const listExpenses = async (filters = {}) => {
  const query = {};

  if (filters.companyId) {
    query.companyId = filters.companyId;
  }
  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) {
      query.date.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.date.$lte = new Date(filters.endDate);
    }
  }

  return Expense.find(query).sort({ date: -1 });
};

/**
 * Obtiene un gasto por su ID.
 * @param {string} id - ID del gasto.
 * @returns {Promise<object>} El gasto encontrado.
 * @throws {notFoundError} Si el gasto no se encuentra.
 */
const getExpenseById = async (id) => {
  const expense = await Expense.findById(id);
  if (!expense) {
    throw notFoundError("Gasto no encontrado.");
  }
  return expense;
};

/**
 * Crea un nuevo gasto.
 * @param {object} expenseData - Datos del gasto a crear.
 * @returns {Promise<object>} El gasto creado.
 */
const createExpense = async (expenseData) => {
  return Expense.create(expenseData);
};

/**
 * Actualiza un gasto existente.
 * @param {string} id - ID del gasto a actualizar.
 * @param {object} updateData - Datos para actualizar el gasto.
 * @returns {Promise<object>} El gasto actualizado.
 */
const updateExpense = async (id, updateData) => {
  return Expense.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

/**
 * Elimina un gasto por su ID.
 * @param {string} id - ID del gasto a eliminar.
 * @returns {Promise<object>} El gasto eliminado.
 */
const deleteExpense = async (id) => {
  const expense = await Expense.findByIdAndDelete(id);
  if (!expense) {
    throw notFoundError("Gasto no encontrado para eliminar.");
  }
  return expense;
};

module.exports = {
  listExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};