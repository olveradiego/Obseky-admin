// Archivo: routes/companyRoutes.js
// Proposito: definicion de endpoints y mapeo hacia controladores.

// Constructor de rutas CRUD para recursos.
const buildResourceRoutes = require("./resourceRoutesFactory");
// Controlador de companies.
const companyController = require("../controllers/companyController");

// Exporta rutas REST de companies.
module.exports = buildResourceRoutes(companyController);


