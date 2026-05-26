// Archivo: application/use-cases/finalcustomers/updateFinalCustomer.js
// Proposito: caso de uso 'updateFinalCustomer' de la entidad 'finalcustomers'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/finalCustomerService");

// Actualiza un registro existente por id.
// Funcion 'updateFinalCustomer': actualiza un registro existente segun id y payload permitido.
const updateFinalCustomer = async (id, payload) => service.updateById(id, payload);

// Exporta el caso de uso para su consumo en controladores.
module.exports = updateFinalCustomer;
