// Archivo: application/use-cases/finalcustomers/createFinalCustomer.js
// Proposito: caso de uso 'createFinalCustomer' de la entidad 'finalcustomers'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/finalCustomerService");

// Crea un nuevo registro a partir del payload recibido.
// Funcion 'createFinalCustomer': crea un registro nuevo aplicando reglas/validaciones del flujo.
const createFinalCustomer = async (payload) => service.createOne(payload);

// Exporta el caso de uso para su consumo en controladores.
module.exports = createFinalCustomer;
