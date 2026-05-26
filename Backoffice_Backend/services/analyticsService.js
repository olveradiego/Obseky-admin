// Archivo: services/analyticsService.js
// Proposito: capa de servicio para la lógica de negocio de analíticas.

const Expense = require("@/models/Expense");
const CardCode = require("@/models/CardCode");
const Order = require("@/models/Order");
const Company = require("@/models/Company");
const { validationError } = require("@/lib/errorCatalog");

/**
 * Obtiene estadísticas de tarjetas, incluyendo el total y el conteo por estado.
 * Permite filtrar por nombre de compañía.
 * @param {string} [companyName] - Nombre de la compañía para filtrar las estadísticas.
 * @returns {Promise<object>} Un objeto con el total de tarjetas y el conteo por estado.
 */
const getCardStatistics = async (companyName) => {
  const matchStage = {};
  if (companyName) {
    // Asegurarse de que la búsqueda sea insensible a mayúsculas/minúsculas y trim.
    matchStage.companyName = { $regex: new RegExp(`^${companyName.trim()}$`, 'i') };
  }

  const pipeline = [
    {
      $match: matchStage,
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: "$_id", // Renombra _id a status
        count: 1
      },
    },
  ];

  const aggregatedResults = await CardCode.aggregate(pipeline);

  let totalCards = 0;

  // Rellena los conteos con los resultados de la agregación
  aggregatedResults.forEach(item => {
    totalCards += item.count;
  });

  return {
    totalCards: totalCards,
    cardsByStatus: aggregatedResults, // Ahora aggregatedResults ya tiene el formato deseado
  };
};

/**
 * Obtiene un resumen financiero que incluye ingresos, egresos y balance.
 * Permite filtrar por nombre de compañía y rango de fechas.
 * @param {string} [companyName] - Nombre de la compañía para filtrar.
 * @param {Date} [startDate] - Fecha de inicio para el filtro.
 * @param {Date} [endDate] - Fecha de fin para el filtro.
 * @returns {Promise<object>} Un objeto con totalRevenue, totalExpenses y balance.
 */
const getFinancialSummary = async ({ companyName, startDate, endDate }) => {
  const matchStage = {};

  if (companyName) {
    // Buscamos el ID de la compañía por nombre para ser precisos
    const regexName = new RegExp(`^${companyName.trim()}$`, 'i');
    const company = await Company.findOne({ name: regexName });
    
    if (company) {
      matchStage.companyId = company._id;
    } else {
      // Si no existe la compañía, forzamos que no encuentre nada para no devolver datos mezclados
      matchStage.companyId = null;
    }
  }

  if (startDate || endDate) {
    // Para Orders seguimos usando createdAt como fecha de transaccion por defecto
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  // 1. Calcular Ingresos y Cuentas por Cobrar (Desde la colección Orders)
  const revenuePipeline = [
    { $match: matchStage },
    { 
      $group: { 
        _id: null, 
        totalRevenue: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$totalAmount", 0] } },
        accountsReceivable: { $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, "$totalAmount", 0] } }
      } 
    },
  ];
  const revenueResult = await Order.aggregate(revenuePipeline);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
  const accountsReceivable = revenueResult.length > 0 ? revenueResult[0].accountsReceivable : 0;

  // 2. Calcular Egresos y Cuentas por Pagar (Desde la colección Expenses)
  // Nota: Expense guarda su fecha principal en el campo 'date'
  const expenseMatchStage = {};
  if (companyName) {
    const regexName = new RegExp(`^${companyName.trim()}$`, 'i');
    const company = await Company.findOne({ name: regexName });
    if (company) expenseMatchStage.companyId = company._id;
    else expenseMatchStage.companyId = null;
  }

  if (startDate || endDate) {
    expenseMatchStage.date = {};
    if (startDate) expenseMatchStage.date.$gte = new Date(startDate);
    if (endDate) expenseMatchStage.date.$lte = new Date(endDate);
  }

  const expensePipeline = [
    { $match: expenseMatchStage },
    { 
      $group: { 
        _id: null, 
        totalExpenses: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$amount", 0] } },
        accountsPayable: { $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, "$amount", 0] } }
      } 
    },
  ];
  const expenseResult = await Expense.aggregate(expensePipeline);
  const totalExpenses = expenseResult.length > 0 ? expenseResult[0].totalExpenses : 0;
  const accountsPayable = expenseResult.length > 0 ? expenseResult[0].accountsPayable : 0;

  const balance = totalRevenue - totalExpenses;

  return {
    totalRevenue,
    totalExpenses,
    balance,
    accountsReceivable,
    accountsPayable
  };
};

/**
 * Obtiene el total de gastos agrupados por categoría.
 * Permite filtrar por rango de fechas.
 * NOTA: El filtrado por companyName para gastos no es directamente compatible con el modelo Expense
 * que usa 'companyId' (ObjectId). Se requeriría un lookup o pasar companyId directamente.
 * @param {string} [companyName] - Nombre de la compañía para filtrar (actualmente no usado para Expense).
 * @param {Date} [startDate] - Fecha de inicio para el filtro.
 * @param {Date} [endDate] - Fecha de fin para el filtro.
 * @returns {Promise<Array<object>>} Un array de objetos con la categoría y el total de gastos.
 */
const getExpensesByCategory = async ({ companyName, startDate, endDate }) => {
  const matchStage = {};

  // Si se proporciona un nombre de compañía, buscamos su ID para filtrar los gastos.
  if (companyName) {
    const regexName = new RegExp(`^${companyName.trim()}$`, "i");
    const company = await Company.findOne({ name: regexName });

    if (company) {
      matchStage.companyId = company._id;
    } else {
      // Si la compañía no existe, no se devolverán gastos.
      return [];
    }
  }

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  if (Object.keys(dateFilter).length > 0) {
    matchStage.date = dateFilter;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: "$category",
        totalAmount: { $sum: "$amount" },
      },
    },
    { $project: { _id: 0, category: "$_id", totalAmount: 1 } },
    { $sort: { totalAmount: -1 } }, // Opcional: ordenar por el monto total
  ];

  const result = await Expense.aggregate(pipeline);
  return result;
};

module.exports = {
  getCardStatistics,
  getFinancialSummary,
  getExpensesByCategory,
};