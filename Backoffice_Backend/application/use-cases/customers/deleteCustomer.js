// Archivo: application/use-cases/customers/deleteCustomer.js
// Proposito: caso de uso 'deleteCustomer' de la entidad 'customers'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/customerService");

// Elimina un registro por id.
// Funcion 'deleteCustomer': elimina registros (individual o masivo) segun reglas de negocio.
const deleteCustomer = async (id) => service.deleteById(id);

// Exporta el caso de uso para su consumo en controladores.
module.exports = deleteCustomer;
