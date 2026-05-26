/**
 * @filePurpose codesUseCases.js
 * @description Casos de uso CRUD por entidad (list/get/create/update/delete/bulk).
 */
import { MODULE_KEYS } from "../../../dominio/constantes/modules";
import { executeCrudOperation } from "../_compartido/executeCrudOperation";

/**
 * @function listCodesUseCase
 * @description Lista codigos de tarjeta mediante el flujo CRUD estandar del modulo `cardcodes`.
 */
export const listCodesUseCase = ({ moduleRepository, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "GET",
    moduleName: MODULE_KEYS.CARD_CODES,
    id: "",
    token,
    moduleFields,
  });

/**
 * @function getCodeByIdUseCase
 * @description Recupera el detalle de un codigo por ID.
 */
export const getCodeByIdUseCase = ({ moduleRepository, id, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "GET",
    moduleName: MODULE_KEYS.CARD_CODES,
    id,
    token,
    moduleFields,
  });

/**
 * @function createCodeUseCase
 * @description Crea un codigo de tarjeta validando el payload contra campos mutables del modulo.
 */
export const createCodeUseCase = ({ moduleRepository, payloadText, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "POST",
    moduleName: MODULE_KEYS.CARD_CODES,
    payloadText,
    token,
    moduleFields,
  });

/**
 * @function updateCodeUseCase
 * @description Actualiza un codigo existente por ID.
 */
export const updateCodeUseCase = ({ moduleRepository, id, payloadText, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "PATCH",
    moduleName: MODULE_KEYS.CARD_CODES,
    id,
    payloadText,
    token,
    moduleFields,
  });

/**
 * @function deleteCodeUseCase
 * @description Elimina un codigo puntual por ID.
 */
export const deleteCodeUseCase = ({ moduleRepository, id, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "DELETE",
    moduleName: MODULE_KEYS.CARD_CODES,
    id,
    token,
    moduleFields,
  });

/**
 * @function bulkDeleteCodesUseCase
 * @description Elimina multiples codigos en una sola solicitud.
 */
export const bulkDeleteCodesUseCase = ({ moduleRepository, selectedIds, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "BULK_DELETE",
    moduleName: MODULE_KEYS.CARD_CODES,
    selectedIds,
    token,
    moduleFields,
  });


