// Archivo: application/use-cases/codes/getCodeById.js
// Proposito: caso de uso 'getCodeById' de la entidad 'codes'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/cardCodeService");

// Busca un registro por identificador.
// Funcion 'getCodeById': obtiene un registro por identificador y permite control de existencia/errores.
const getCodeById = async (id) => service.getById(id);

// Exporta el caso de uso para su consumo en controladores.
module.exports = getCodeById;
