// Archivo: controllers/finalCustomerController.js
// Proposito: controlador HTTP; transforma request/response y delega la logica de negocio.

const buildCrudController = require("./crudControllerFactory");
const { MODULES } = require("../services/rolePermissionService");
const listFinalCustomers = require("../application/use-cases/finalcustomers/listFinalCustomers");
const getFinalCustomerById = require("../application/use-cases/finalcustomers/getFinalCustomerById");
const createFinalCustomer = require("../application/use-cases/finalcustomers/createFinalCustomer");
const updateFinalCustomer = require("../application/use-cases/finalcustomers/updateFinalCustomer");
const deleteFinalCustomer = require("../application/use-cases/finalcustomers/deleteFinalCustomer");
const bulkDeleteFinalCustomers = require("../application/use-cases/finalcustomers/bulkDeleteFinalCustomers");

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = buildCrudController({
  moduleName: MODULES.FINALCUSTOMERS,
  resourceLabel: "FinalCustomer",
  useCases: {
    list: listFinalCustomers,
    getById: getFinalCustomerById,
    create: createFinalCustomer,
    update: updateFinalCustomer,
    delete: deleteFinalCustomer,
    bulkDelete: bulkDeleteFinalCustomers,
  },
  messages: {
    create: "FinalCustomer creado",
    update: "FinalCustomer actualizado",
    delete: "FinalCustomer eliminado",
    bulkDelete: "FinalCustomers eliminados",
  },
});


