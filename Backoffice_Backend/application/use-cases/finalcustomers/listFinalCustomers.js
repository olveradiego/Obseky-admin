// Archivo: application/use-cases/finalcustomers/listFinalCustomers.js
// Proposito: caso de uso 'listFinalCustomers' de la entidad 'finalcustomers'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/finalCustomerService");

// Ejecuta el listado de registros de la entidad.
// Funcion 'listFinalCustomers': lista registros de la entidad/modulo y prepara datos para respuesta.
const listFinalCustomers = async () => service.list();

// Exporta el caso de uso para su consumo en controladores.
module.exports = listFinalCustomers;
