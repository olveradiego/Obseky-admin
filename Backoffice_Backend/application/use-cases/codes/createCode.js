// Archivo: application/use-cases/codes/createCode.js
// Proposito: caso de uso 'createCode' de la entidad 'codes'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/cardCodeService");

// Crea un nuevo registro a partir del payload recibido.
// Funcion 'createCode': crea un registro nuevo aplicando reglas/validaciones del flujo.
const createCode = async (payload) => service.createOne(payload);

// Exporta el caso de uso para su consumo en controladores.
module.exports = createCode;
