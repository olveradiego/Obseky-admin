// Archivo: controllers/customerController.js
// Proposito: controlador HTTP; transforma request/response y delega la logica de negocio.

const buildCrudController = require("./crudControllerFactory");
const { MODULES } = require("../services/rolePermissionService");
const listCustomers = require("../application/use-cases/customers/listCustomers");
const getCustomerById = require("../application/use-cases/customers/getCustomerById");
const createCustomer = require("../application/use-cases/customers/createCustomer");
const updateCustomer = require("../application/use-cases/customers/updateCustomer");
const deleteCustomer = require("../application/use-cases/customers/deleteCustomer");
const bulkDeleteCustomers = require("../application/use-cases/customers/bulkDeleteCustomers");

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = buildCrudController({
  moduleName: MODULES.CUSTOMERS,
  resourceLabel: "Customer",
  useCases: {
    list: listCustomers,
    getById: getCustomerById,
    create: createCustomer,
    update: updateCustomer,
    delete: deleteCustomer,
    bulkDelete: bulkDeleteCustomers,
  },
  messages: {
    create: "Customer creado",
    update: "Customer actualizado",
    delete: "Customer eliminado",
    bulkDelete: "Customers eliminados",
  },
});


