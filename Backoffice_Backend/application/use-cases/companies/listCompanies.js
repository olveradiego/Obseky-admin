// Archivo: application/use-cases/companies/listCompanies.js
// Proposito: caso de uso 'listCompanies' de la entidad 'companies'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/companyService");

// Ejecuta el listado de registros de la entidad.
// Funcion 'listCompanies': lista registros de la entidad/modulo y prepara datos para respuesta.
const listCompanies = async () => service.list();

// Exporta el caso de uso para su consumo en controladores.
module.exports = listCompanies;
