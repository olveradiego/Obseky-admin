// Archivo: application/use-cases/users/bulkDeleteUsers.js
// Proposito: caso de uso 'bulkDeleteUsers' de la entidad 'users'; orquesta una accion puntual del dominio.

// Servicio de users y catalogo de errores de negocio.
const service = require("../../../services/userService");
const { forbiddenError } = require("../../../lib/errorCatalog");

// Elimina varios usuarios por ids evitando auto-eliminacion del actor autenticado.
// Funcion 'bulkDeleteUsers': elimina varios registros por ids y devuelve resumen de resultados.
const bulkDeleteUsers = async ({ ids, actorAdminId }) => {
  const normalizedIds = Array.isArray(ids) ? ids.map((id) => String(id)) : [];
  if (normalizedIds.includes(String(actorAdminId))) {
    throw forbiddenError("No se permite auto-eliminacion del usuario autenticado");
  }
  return service.bulkDeleteByIds(normalizedIds);
};

// Exporta el caso de uso para su consumo en controladores.
module.exports = bulkDeleteUsers;
