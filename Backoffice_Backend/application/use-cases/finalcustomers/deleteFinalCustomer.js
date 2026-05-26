// Archivo: application/use-cases/finalcustomers/deleteFinalCustomer.js
// Proposito: caso de uso 'deleteFinalCustomer' de la entidad 'finalcustomers'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/finalCustomerService");

// Elimina un registro por id.
// Funcion 'deleteFinalCustomer': elimina registros (individual o masivo) segun reglas de negocio.
const deleteFinalCustomer = async (id) => service.deleteById(id);

// Exporta el caso de uso para su consumo en controladores.
module.exports = deleteFinalCustomer;
