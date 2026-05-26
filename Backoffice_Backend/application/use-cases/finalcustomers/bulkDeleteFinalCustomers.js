// Archivo: application/use-cases/finalcustomers/bulkDeleteFinalCustomers.js
// Proposito: caso de uso 'bulkDeleteFinalCustomers' de la entidad 'finalcustomers'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/finalCustomerService");

// Elimina un conjunto de registros por lista de ids.
// Funcion 'bulkDeleteFinalCustomers': elimina varios registros por ids y devuelve resumen de resultados.
const bulkDeleteFinalCustomers = async (ids) => service.bulkDeleteByIds(ids);

// Exporta el caso de uso para su consumo en controladores.
module.exports = bulkDeleteFinalCustomers;
