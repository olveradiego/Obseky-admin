// Archivo: application/use-cases/users/listUsers.js
// Proposito: caso de uso 'listUsers' de la entidad 'users'; orquesta una accion puntual del dominio.

// Servicio de users para operaciones de lectura/escritura.
const service = require("../../../services/userService");

// Lista usuarios administradores.
// Funcion 'listUsers': lista registros de la entidad/modulo y prepara datos para respuesta.
const listUsers = async () => service.list();

// Exporta el caso de uso para su consumo en controladores.
module.exports = listUsers;
