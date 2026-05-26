// Archivo: application/use-cases/users/updateUser.js
// Proposito: caso de uso 'updateUser' de la entidad 'users'; orquesta una accion puntual del dominio.

// Servicio de users para operaciones de lectura/escritura.
const service = require("../../../services/userService");

// Actualiza un usuario administrador por id.
// Funcion 'updateUser': actualiza un registro existente segun id y payload permitido.
const updateUser = async (id, payload) => service.updateById(id, payload);

// Exporta el caso de uso para su consumo en controladores.
module.exports = updateUser;
