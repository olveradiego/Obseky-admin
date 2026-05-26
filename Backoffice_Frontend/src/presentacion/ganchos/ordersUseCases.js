/**
 * @filePurpose ordersUseCases.js
 * @description Casos de uso CRUD para el mÃ³dulo de Ã“rdenes.
 */
import { MODULE_KEYS } from "@/dominio/constantes/modules";
import { executeCrudOperation } from "@/aplicacion/casos-de-uso/_compartido/executeCrudOperation";

export const listOrdersUseCase = ({ moduleRepository, token, moduleFields, filters }) =>
  executeCrudOperation({
    moduleRepository,
    method: "GET",
    moduleName: MODULE_KEYS.ORDERS,
    id: "",
    token,
    moduleFields,
    filters,
  });

export const getOrderByIdUseCase = ({ moduleRepository, id, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "GET",
    moduleName: MODULE_KEYS.ORDERS,
    id,
    token,
    moduleFields,
  });

export const createOrderUseCase = ({ moduleRepository, payloadText, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "POST",
    moduleName: MODULE_KEYS.ORDERS,
    payloadText,
    token,
    moduleFields,
  });

export const updateOrderUseCase = ({ moduleRepository, id, payloadText, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "PATCH",
    moduleName: MODULE_KEYS.ORDERS,
    id,
    payloadText,
    token,
    moduleFields,
  });

export const deleteOrderUseCase = ({ moduleRepository, id, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "DELETE",
    moduleName: MODULE_KEYS.ORDERS,
    id,
    token,
    moduleFields,
  });

export const bulkDeleteOrdersUseCase = ({ moduleRepository, selectedIds, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "BULK_DELETE",
    moduleName: MODULE_KEYS.ORDERS,
    selectedIds,
    token,
    moduleFields,
  });
