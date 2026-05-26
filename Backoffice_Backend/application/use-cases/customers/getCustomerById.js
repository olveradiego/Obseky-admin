// Archivo: application/use-cases/customers/getCustomerById.js
// Proposito: caso de uso 'getCustomerById' de la entidad 'customers'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/customerService");

// Busca un registro por identificador.
// Funcion 'getCustomerById': obtiene un registro por identificador y permite control de existencia/errores.
const getCustomerById = async (id) => service.getById(id);

// Exporta el caso de uso para su consumo en controladores.
module.exports = getCustomerById;
