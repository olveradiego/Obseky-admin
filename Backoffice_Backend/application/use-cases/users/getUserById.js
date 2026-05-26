// Archivo: application/use-cases/users/getUserById.js
// Proposito: caso de uso 'getUserById' de la entidad 'users'; orquesta una accion puntual del dominio.

// Servicio de users para operaciones de lectura/escritura.
const service = require("../../../services/userService");

// Obtiene un usuario administrador por id.
// Funcion 'getUserById': obtiene un registro por identificador y permite control de existencia/errores.
const getUserById = async (id) => service.getById(id);

// Exporta el caso de uso para su consumo en controladores.
module.exports = getUserById;
