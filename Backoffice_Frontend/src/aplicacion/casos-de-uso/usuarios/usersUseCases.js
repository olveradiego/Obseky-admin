/**
 * @filePurpose usersUseCases.js
 * @description Casos de uso CRUD por entidad (list/get/create/update/delete/bulk).
 */
import { MODULE_KEYS } from "../../../dominio/constantes/modules";
import { executeCrudOperation } from "../_compartido/executeCrudOperation";

/**
 * @function listUsersUseCase
 * @description Obtiene la lista de usuarios usando el caso de uso de lectura de coleccion.
 */
export const listUsersUseCase = ({ moduleRepository, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "GET",
    moduleName: MODULE_KEYS.USERS,
    id: "",
    token,
    moduleFields,
  });

/**
 * @function getUserByIdUseCase
 * @description Obtiene un usuario puntual por ID.
 */
export const getUserByIdUseCase = ({ moduleRepository, id, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "GET",
    moduleName: MODULE_KEYS.USERS,
    id,
    token,
    moduleFields,
  });

/**
 * @function createUserUseCase
 * @description Crea un usuario nuevo con el payload suministrado.
 */
export const createUserUseCase = ({ moduleRepository, payloadText, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "POST",
    moduleName: MODULE_KEYS.USERS,
    payloadText,
    token,
    moduleFields,
  });

/**
 * @function updateUserUseCase
 * @description Actualiza un usuario existente por ID.
 */
export const updateUserUseCase = ({ moduleRepository, id, payloadText, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "PATCH",
    moduleName: MODULE_KEYS.USERS,
    id,
    payloadText,
    token,
    moduleFields,
  });

/**
 * @function deleteUserUseCase
 * @description Elimina un usuario por ID.
 */
export const deleteUserUseCase = ({ moduleRepository, id, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "DELETE",
    moduleName: MODULE_KEYS.USERS,
    id,
    token,
    moduleFields,
  });

/**
 * @function bulkDeleteUsersUseCase
 * @description Elimina multiples usuarios en una sola operacion.
 */
export const bulkDeleteUsersUseCase = ({ moduleRepository, selectedIds, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "BULK_DELETE",
    moduleName: MODULE_KEYS.USERS,
    selectedIds,
    token,
    moduleFields,
  });


