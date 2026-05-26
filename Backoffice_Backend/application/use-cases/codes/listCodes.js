// Archivo: application/use-cases/codes/listCodes.js
// Proposito: caso de uso 'listCodes' de la entidad 'codes'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/cardCodeService");

// Ejecuta el listado de registros de la entidad.
// Funcion 'listCodes': lista registros de la entidad/modulo y prepara datos para respuesta.
const listCodes = async () => service.list();

// Exporta el caso de uso para su consumo en controladores.
module.exports = listCodes;
