// Archivo: application/use-cases/companies/getCompanyById.js
// Proposito: caso de uso 'getCompanyById' de la entidad 'companies'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/companyService");

// Busca un registro por identificador.
// Funcion 'getCompanyById': obtiene un registro por identificador y permite control de existencia/errores.
const getCompanyById = async (id) => service.getById(id);

// Exporta el caso de uso para su consumo en controladores.
module.exports = getCompanyById;
