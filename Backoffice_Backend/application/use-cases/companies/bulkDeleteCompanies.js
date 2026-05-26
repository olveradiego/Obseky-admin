// Archivo: application/use-cases/companies/bulkDeleteCompanies.js
// Proposito: caso de uso 'bulkDeleteCompanies' de la entidad 'companies'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/companyService");

// Elimina un conjunto de registros por lista de ids.
// Funcion 'bulkDeleteCompanies': elimina varios registros por ids y devuelve resumen de resultados.
const bulkDeleteCompanies = async (ids) => service.bulkDeleteByIds(ids);

// Exporta el caso de uso para su consumo en controladores.
module.exports = bulkDeleteCompanies;
