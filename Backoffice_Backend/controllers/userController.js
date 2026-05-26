// Archivo: controllers/userController.js
// Proposito: controlador HTTP; transforma request/response y delega la logica de negocio.

const buildCrudController = require("./crudControllerFactory");
const { MODULES } = require("../services/rolePermissionService");
const listUsers = require("../application/use-cases/users/listUsers");
const getUserById = require("../application/use-cases/users/getUserById");
const createUser = require("../application/use-cases/users/createUser");
const updateUser = require("../application/use-cases/users/updateUser");
const deleteUser = require("../application/use-cases/users/deleteUser");
const bulkDeleteUsers = require("../application/use-cases/users/bulkDeleteUsers");

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = buildCrudController({
  moduleName: MODULES.USERS,
  resourceLabel: "Usuario",
  useCases: {
    list: listUsers,
    getById: getUserById,
    create: createUser,
    update: updateUser,
    delete: async (id, actor) => deleteUser({ id, actorAdminId: actor.adminId }),
    bulkDelete: async (ids, actor) => bulkDeleteUsers({ ids, actorAdminId: actor.adminId }),
  },
  messages: {
    create: "Usuario creado",
    update: "Usuario actualizado",
    delete: "Usuario eliminado",
    bulkDelete: "Usuarios eliminados",
  },
});


