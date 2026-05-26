// Archivo: application/use-cases/codes/bulkDeleteCodes.js
// Proposito: caso de uso 'bulkDeleteCodes' de la entidad 'codes'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/cardCodeService");

// Elimina un conjunto de registros por lista de ids.
// Funcion 'bulkDeleteCodes': elimina varios registros por ids y devuelve resumen de resultados.
const bulkDeleteCodes = async (ids) => service.bulkDeleteByIds(ids);

// Exporta el caso de uso para su consumo en controladores.
module.exports = bulkDeleteCodes;
