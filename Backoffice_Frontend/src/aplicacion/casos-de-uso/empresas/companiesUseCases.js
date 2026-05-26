/**
 * @filePurpose companiesUseCases.js
 * @description Casos de uso CRUD por entidad (list/get/create/update/delete/bulk).
 */
import { MODULE_KEYS } from "../../../dominio/constantes/modules";
import { executeCrudOperation } from "../_compartido/executeCrudOperation";

/**
 * @function listCompaniesUseCase
 * @description Ejecuta la logica asociada a 'list companies use case' y retorna su resultado.
 */
export const listCompaniesUseCase = ({ moduleRepository, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "GET",
    moduleName: MODULE_KEYS.COMPANIES,
    id: "",
    token,
    moduleFields,
  });

/**
 * @function getCompanyByIdUseCase
 * @description Ejecuta la logica asociada a 'get company by id use case' y retorna su resultado.
 */
export const getCompanyByIdUseCase = ({ moduleRepository, id, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "GET",
    moduleName: MODULE_KEYS.COMPANIES,
    id,
    token,
    moduleFields,
  });

/**
 * @function createCompanyUseCase
 * @description Ejecuta la logica asociada a 'create company use case' y retorna su resultado.
 */
export const createCompanyUseCase = ({ moduleRepository, payloadText, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "POST",
    moduleName: MODULE_KEYS.COMPANIES,
    payloadText,
    token,
    moduleFields,
  });

/**
 * @function updateCompanyUseCase
 * @description Ejecuta la logica asociada a 'update company use case' y retorna su resultado.
 */
export const updateCompanyUseCase = ({ moduleRepository, id, payloadText, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "PATCH",
    moduleName: MODULE_KEYS.COMPANIES,
    id,
    payloadText,
    token,
    moduleFields,
  });

/**
 * @function deleteCompanyUseCase
 * @description Ejecuta la logica asociada a 'delete company use case' y retorna su resultado.
 */
export const deleteCompanyUseCase = ({ moduleRepository, id, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "DELETE",
    moduleName: MODULE_KEYS.COMPANIES,
    id,
    token,
    moduleFields,
  });

/**
 * @function bulkDeleteCompaniesUseCase
 * @description Ejecuta la logica asociada a 'bulk delete companies use case' y retorna su resultado.
 */
export const bulkDeleteCompaniesUseCase = ({ moduleRepository, selectedIds, token, moduleFields }) =>
  executeCrudOperation({
    moduleRepository,
    method: "BULK_DELETE",
    moduleName: MODULE_KEYS.COMPANIES,
    selectedIds,
    token,
    moduleFields,
  });


