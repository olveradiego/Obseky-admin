// Archivo: application/use-cases/customers/createCustomer.js
// Proposito: caso de uso 'createCustomer' de la entidad 'customers'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/customerService");

// Crea un nuevo registro a partir del payload recibido.
// Funcion 'createCustomer': crea un registro nuevo aplicando reglas/validaciones del flujo.
const createCustomer = async (payload) => service.createOne(payload);

// Exporta el caso de uso para su consumo en controladores.
module.exports = createCustomer;
