// Archivo: application/use-cases/companies/deleteCompany.js
// Proposito: caso de uso 'deleteCompany' de la entidad 'companies'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/companyService");

// Elimina un registro por id.
// Funcion 'deleteCompany': elimina registros (individual o masivo) segun reglas de negocio.
const deleteCompany = async (id) => service.deleteById(id);

// Exporta el caso de uso para su consumo en controladores.
module.exports = deleteCompany;
