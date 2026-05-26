// Archivo: routes/finalCustomerRoutes.js
// Proposito: definicion de endpoints y mapeo hacia controladores.

// Fábrica común de rutas REST.
const buildResourceRoutes = require("./resourceRoutesFactory");
// Controlador para finalcustomers.
const finalCustomerController = require("../controllers/finalCustomerController");

// Exporta rutas REST de finalcustomers.
module.exports = buildResourceRoutes(finalCustomerController);


