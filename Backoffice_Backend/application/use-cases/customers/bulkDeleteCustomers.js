// Archivo: application/use-cases/customers/bulkDeleteCustomers.js
// Proposito: caso de uso 'bulkDeleteCustomers' de la entidad 'customers'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/customerService");

// Elimina un conjunto de registros por lista de ids.
// Funcion 'bulkDeleteCustomers': elimina varios registros por ids y devuelve resumen de resultados.
const bulkDeleteCustomers = async (ids) => service.bulkDeleteByIds(ids);

// Exporta el caso de uso para su consumo en controladores.
module.exports = bulkDeleteCustomers;
