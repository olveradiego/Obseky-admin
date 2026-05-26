// Archivo: application/use-cases/codes/deleteCode.js
// Proposito: caso de uso 'deleteCode' de la entidad 'codes'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/cardCodeService");

// Elimina un registro por id.
// Funcion 'deleteCode': elimina registros (individual o masivo) segun reglas de negocio.
const deleteCode = async (id) => service.deleteById(id);

// Exporta el caso de uso para su consumo en controladores.
module.exports = deleteCode;
