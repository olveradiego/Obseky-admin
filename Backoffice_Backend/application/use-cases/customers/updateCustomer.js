// Archivo: application/use-cases/customers/updateCustomer.js
// Proposito: caso de uso 'updateCustomer' de la entidad 'customers'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/customerService");

// Actualiza un registro existente por id.
// Funcion 'updateCustomer': actualiza un registro existente segun id y payload permitido.
const updateCustomer = async (id, payload) => service.updateById(id, payload);

// Exporta el caso de uso para su consumo en controladores.
module.exports = updateCustomer;
