// Archivo: application/use-cases/companies/createCompany.js
// Proposito: caso de uso 'createCompany' de la entidad 'companies'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/companyService");

// Crea un nuevo registro a partir del payload recibido.
// Funcion 'createCompany': crea un registro nuevo aplicando reglas/validaciones del flujo.
const createCompany = async (payload) => service.createOne(payload);

// Exporta el caso de uso para su consumo en controladores.
module.exports = createCompany;
