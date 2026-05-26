/**
 * @filePurpose finalCustomersUseCases.js
 * @description Casos de uso CRUD por entidad (list/get/create/update/delete/bulk).
 */
import { MODULE_KEYS } from "../../../dominio/constantes/modules";
import { executeCrudOperation } from "../_compartido/executeCrudOperation";

/**
 * @function listFinalCustomersUseCase
 * @description Ejecuta la logica asociada a 'list final customers use case' y retorna su resultado.
 */
export const listFinalCustomersUseCase = ({ moduleRepository, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "GET",
    moduleName: MODULE_KEYS.FINAL_CUSTOMERS,
    id: "",
    token,
    moduleFields,
  });

/**
 * @function getFinalCustomerByIdUseCase
 * @description Ejecuta la logica asociada a 'get final customer by id use case' y retorna su resultado.
 */
export const getFinalCustomerByIdUseCase = ({ moduleRepository, id, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "GET",
    moduleName: MODULE_KEYS.FINAL_CUSTOMERS,
    id,
    token,
    moduleFields,
  });

/**
 * @function createFinalCustomerUseCase
 * @description Ejecuta la logica asociada a 'create final customer use case' y retorna su resultado.
 */
export const createFinalCustomerUseCase = ({ moduleRepository, payloadText, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "POST",
    moduleName: MODULE_KEYS.FINAL_CUSTOMERS,
    payloadText,
    token,
    moduleFields,
  });

/**
 * @function updateFinalCustomerUseCase
 * @description Ejecuta la logica asociada a 'update final customer use case' y retorna su resultado.
 */
export const updateFinalCustomerUseCase = ({ moduleRepository, id, payloadText, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "PATCH",
    moduleName: MODULE_KEYS.FINAL_CUSTOMERS,
    id,
    payloadText,
    token,
    moduleFields,
  });

/**
 * @function deleteFinalCustomerUseCase
 * @description Ejecuta la logica asociada a 'delete final customer use case' y retorna su resultado.
 */
export const deleteFinalCustomerUseCase = ({ moduleRepository, id, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "DELETE",
    moduleName: MODULE_KEYS.FINAL_CUSTOMERS,
    id,
    token,
    moduleFields,
  });

/**
 * @function bulkDeleteFinalCustomersUseCase
 * @description Ejecuta la logica asociada a 'bulk delete final customers use case' y retorna su resultado.
 */
export const bulkDeleteFinalCustomersUseCase = ({ moduleRepository, selectedIds, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "BULK_DELETE",
    moduleName: MODULE_KEYS.FINAL_CUSTOMERS,
    selectedIds,
    token,
    moduleFields,
  });


