// Archivo: controllers/companyController.js
// Proposito: controlador HTTP; transforma request/response y delega la logica de negocio.

const buildCrudController = require("./crudControllerFactory");
const { MODULES } = require("../services/rolePermissionService");
const listCompanies = require("../application/use-cases/companies/listCompanies");
const getCompanyById = require("../application/use-cases/companies/getCompanyById");
const createCompany = require("../application/use-cases/companies/createCompany");
const updateCompany = require("../application/use-cases/companies/updateCompany");
const deleteCompany = require("../application/use-cases/companies/deleteCompany");
const bulkDeleteCompanies = require("../application/use-cases/companies/bulkDeleteCompanies");

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = buildCrudController({
  moduleName: MODULES.COMPANIES,
  resourceLabel: "Company",
  useCases: {
    list: listCompanies,
    getById: getCompanyById,
    create: createCompany,
    update: updateCompany,
    delete: deleteCompany,
    bulkDelete: bulkDeleteCompanies,
  },
  messages: {
    create: "Company creada",
    update: "Company actualizada",
    delete: "Company eliminada",
    bulkDelete: "Companies eliminadas",
  },
});


