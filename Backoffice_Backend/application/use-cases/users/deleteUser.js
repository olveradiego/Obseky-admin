// Archivo: application/use-cases/users/deleteUser.js
// Proposito: caso de uso 'deleteUser' de la entidad 'users'; orquesta una accion puntual del dominio.

// Servicio de users y catalogo de errores de negocio.
const service = require("../../../services/userService");
const { forbiddenError } = require("../../../lib/errorCatalog");

// Elimina un usuario por id evitando auto-eliminacion del actor autenticado.
// Funcion 'deleteUser': elimina registros (individual o masivo) segun reglas de negocio.
const deleteUser = async ({ id, actorAdminId }) => {
  if (String(actorAdminId) === String(id)) {
    throw forbiddenError("No se permite auto-eliminacion del usuario autenticado");
  }
  return service.deleteById(id);
};

// Exporta el caso de uso para su consumo en controladores.
module.exports = deleteUser;
