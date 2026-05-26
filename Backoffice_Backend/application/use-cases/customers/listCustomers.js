// Archivo: application/use-cases/customers/listCustomers.js
// Proposito: caso de uso 'listCustomers' de la entidad 'customers'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/customerService");

// Ejecuta el listado de registros de la entidad.
// Funcion 'listCustomers': lista registros de la entidad/modulo y prepara datos para respuesta.
const listCustomers = async () => service.list();

// Exporta el caso de uso para su consumo en controladores.
module.exports = listCustomers;
