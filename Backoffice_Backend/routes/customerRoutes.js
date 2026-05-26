// Archivo: routes/customerRoutes.js
// Proposito: definicion de endpoints y mapeo hacia controladores.

// Fábrica genérica de rutas.
const buildResourceRoutes = require("./resourceRoutesFactory");
// Controlador para customers.
const customerController = require("../controllers/customerController");

// Exporta rutas REST de customers.
module.exports = buildResourceRoutes(customerController);


