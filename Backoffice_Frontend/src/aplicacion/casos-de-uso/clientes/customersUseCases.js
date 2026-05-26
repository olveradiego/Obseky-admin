/**
 * @filePurpose customersUseCases.js
 * @description Casos de uso CRUD por entidad (list/get/create/update/delete/bulk).
 */
import { MODULE_KEYS } from "../../../dominio/constantes/modules";
import { executeCrudOperation } from "../_compartido/executeCrudOperation";

/**
 * @function listCustomersUseCase
 * @description Ejecuta la logica asociada a 'list customers use case' y retorna su resultado.
 */
export const listCustomersUseCase = ({ moduleRepository, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "GET",
    moduleName: MODULE_KEYS.CUSTOMERS,
    id: "",
    token,
    moduleFields,
  });

/**
 * @function getCustomerByIdUseCase
 * @description Ejecuta la logica asociada a 'get customer by id use case' y retorna su resultado.
 */
export const getCustomerByIdUseCase = ({ moduleRepository, id, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "GET",
    moduleName: MODULE_KEYS.CUSTOMERS,
    id,
    token,
    moduleFields,
  });

/**
 * @function createCustomerUseCase
 * @description Ejecuta la logica asociada a 'create customer use case' y retorna su resultado.
 */
export const createCustomerUseCase = ({ moduleRepository, payloadText, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "POST",
    moduleName: MODULE_KEYS.CUSTOMERS,
    payloadText,
    token,
    moduleFields,
  });

/**
 * @function updateCustomerUseCase
 * @description Ejecuta la logica asociada a 'update customer use case' y retorna su resultado.
 */
export const updateCustomerUseCase = ({ moduleRepository, id, payloadText, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "PATCH",
    moduleName: MODULE_KEYS.CUSTOMERS,
    id,
    payloadText,
    token,
    moduleFields,
  });

/**
 * @function deleteCustomerUseCase
 * @description Ejecuta la logica asociada a 'delete customer use case' y retorna su resultado.
 */
export const deleteCustomerUseCase = ({ moduleRepository, id, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "DELETE",
    moduleName: MODULE_KEYS.CUSTOMERS,
    id,
    token,
    moduleFields,
  });

/**
 * @function bulkDeleteCustomersUseCase
 * @description Ejecuta la logica asociada a 'bulk delete customers use case' y retorna su resultado.
 */
export const bulkDeleteCustomersUseCase = ({ moduleRepository, selectedIds, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "BULK_DELETE",
    moduleName: MODULE_KEYS.CUSTOMERS,
    selectedIds,
    token,
    moduleFields,
  });


