// Archivo: application/use-cases/users/createUser.js
// Proposito: caso de uso 'createUser' de la entidad 'users'; orquesta una accion puntual del dominio.

// Servicio de users para operaciones de lectura/escritura.
const service = require("../../../services/userService");

// Crea un usuario administrador.
// Funcion 'createUser': crea un registro nuevo aplicando reglas/validaciones del flujo.
const createUser = async (payload) => service.createOne(payload);

// Exporta el caso de uso para su consumo en controladores.
module.exports = createUser;
