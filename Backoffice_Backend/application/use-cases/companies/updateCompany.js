// Archivo: application/use-cases/companies/updateCompany.js
// Proposito: caso de uso 'updateCompany' de la entidad 'companies'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/companyService");

// Actualiza un registro existente por id.
// Funcion 'updateCompany': actualiza un registro existente segun id y payload permitido.
const updateCompany = async (id, payload) => service.updateById(id, payload);

// Exporta el caso de uso para su consumo en controladores.
module.exports = updateCompany;
