// Archivo: application/use-cases/codes/updateCode.js
// Proposito: caso de uso 'updateCode' de la entidad 'codes'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/cardCodeService");

// Actualiza un registro existente por id.
// Funcion 'updateCode': actualiza un registro existente segun id y payload permitido.
const updateCode = async (id, payload) => service.updateById(id, payload);

// Exporta el caso de uso para su consumo en controladores.
module.exports = updateCode;
