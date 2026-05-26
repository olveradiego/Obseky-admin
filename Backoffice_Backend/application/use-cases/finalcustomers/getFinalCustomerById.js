// Archivo: application/use-cases/finalcustomers/getFinalCustomerById.js
// Proposito: caso de uso 'getFinalCustomerById' de la entidad 'finalcustomers'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/finalCustomerService");

// Busca un registro por identificador.
// Funcion 'getFinalCustomerById': obtiene un registro por identificador y permite control de existencia/errores.
const getFinalCustomerById = async (id) => service.getById(id);

// Exporta el caso de uso para su consumo en controladores.
module.exports = getFinalCustomerById;
