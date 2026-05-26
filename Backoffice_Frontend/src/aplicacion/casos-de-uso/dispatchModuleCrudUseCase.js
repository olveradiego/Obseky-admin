/**
 * @filePurpose dispatchModuleCrudUseCase.js
 * @description Despachador de casos de uso por entidad/metodo.
 */
import { MODULE_KEYS } from "@/dominio/constantes/modules";
import {
  bulkDeleteCompaniesUseCase,
  createCompanyUseCase,
  deleteCompanyUseCase,
  getCompanyByIdUseCase,
  listCompaniesUseCase,
  updateCompanyUseCase,
} from "./empresas/companiesUseCases";
import {
  bulkDeleteCodesUseCase,
  createCodeUseCase,
  deleteCodeUseCase,
  getCodeByIdUseCase,
  listCodesUseCase,
  updateCodeUseCase,
} from "./codigos/codesUseCases";
import {
  bulkDeleteCustomersUseCase,
  createCustomerUseCase,
  deleteCustomerUseCase,
  getCustomerByIdUseCase,
  listCustomersUseCase,
  updateCustomerUseCase,
} from "./clientes/customersUseCases";
import {
  bulkDeleteFinalCustomersUseCase,
  createFinalCustomerUseCase,
  deleteFinalCustomerUseCase,
  getFinalCustomerByIdUseCase,
  listFinalCustomersUseCase,
  updateFinalCustomerUseCase,
} from "./clientes-finales/finalCustomersUseCases";
import {
  bulkDeleteUsersUseCase,
  createUserUseCase,
  deleteUserUseCase,
  getUserByIdUseCase,
  listUsersUseCase,
  updateUserUseCase,
} from "./usuarios/usersUseCases";
import {
  bulkDeleteExpensesUseCase,
  createExpenseUseCase,
  deleteExpenseUseCase,
  getExpenseByIdUseCase,
  listExpensesUseCase,
  updateExpenseUseCase,
} from "./gastos/expensesUseCases";
import {
  bulkDeleteOrdersUseCase,
  createOrderUseCase,
  deleteOrderUseCase,
  getOrderByIdUseCase,
  listOrdersUseCase,
  updateOrderUseCase,
} from "@/presentacion/ganchos/ordersUseCases.js";

/**
 * @function buildMethodMap
 * @description Crea un mapa de ejecucion por metodo HTTP para una entidad, con GET inteligente (lista/detalle).
 */
const buildMethodMap = ({
  list,
  getById,
  create,
  update,
  remove,
  bulkDelete,
}) => ({
  GET: ({ id = "", ...rest }) =>
    String(id || "").trim().length > 0 ? getById({ ...rest, id }) : list({ ...rest }),
  POST: create,
  PATCH: update,
  DELETE: remove,
  BULK_DELETE: bulkDelete,
});

const ENTITY_METHOD_MAP = {
  [MODULE_KEYS.USERS]: buildMethodMap({
    list: listUsersUseCase,
    getById: getUserByIdUseCase,
    create: createUserUseCase,
    update: updateUserUseCase,
    remove: deleteUserUseCase,
    bulkDelete: bulkDeleteUsersUseCase,
  }),
  [MODULE_KEYS.COMPANIES]: buildMethodMap({
    list: listCompaniesUseCase,
    getById: getCompanyByIdUseCase,
    create: createCompanyUseCase,
    update: updateCompanyUseCase,
    remove: deleteCompanyUseCase,
    bulkDelete: bulkDeleteCompaniesUseCase,
  }),
  [MODULE_KEYS.CUSTOMERS]: buildMethodMap({
    list: listCustomersUseCase,
    getById: getCustomerByIdUseCase,
    create: createCustomerUseCase,
    update: updateCustomerUseCase,
    remove: deleteCustomerUseCase,
    bulkDelete: bulkDeleteCustomersUseCase,
  }),
  [MODULE_KEYS.FINAL_CUSTOMERS]: buildMethodMap({
    list: listFinalCustomersUseCase,
    getById: getFinalCustomerByIdUseCase,
    create: createFinalCustomerUseCase,
    update: updateFinalCustomerUseCase,
    remove: deleteFinalCustomerUseCase,
    bulkDelete: bulkDeleteFinalCustomersUseCase,
  }),
  [MODULE_KEYS.CARD_CODES]: buildMethodMap({
    list: listCodesUseCase,
    getById: getCodeByIdUseCase,
    create: createCodeUseCase,
    update: updateCodeUseCase,
    remove: deleteCodeUseCase,
    bulkDelete: bulkDeleteCodesUseCase,
  }),
  [MODULE_KEYS.EXPENSES]: buildMethodMap({
    list: listExpensesUseCase,
    getById: getExpenseByIdUseCase,
    create: createExpenseUseCase,
    update: updateExpenseUseCase,
    remove: deleteExpenseUseCase,
    bulkDelete: bulkDeleteExpensesUseCase,
  }),
  [MODULE_KEYS.ORDERS]: buildMethodMap({
    list: listOrdersUseCase,
    getById: getOrderByIdUseCase,
    create: createOrderUseCase,
    update: updateOrderUseCase,
    remove: deleteOrderUseCase,
    bulkDelete: bulkDeleteOrdersUseCase,
  }),
};

export const dispatchModuleCrudUseCase = async ({
  moduleName,
  method,
  ...params
}) => {
  // Resuelve la entidad objetivo y valida que exista soporte en el dispatcher.
  const entityMap = ENTITY_METHOD_MAP[moduleName];
  if (!entityMap) throw new Error(`Modulo no soportado: ${moduleName}`);

  // Resuelve la operacion concreta dentro de la entidad (GET/POST/PATCH/DELETE/BULK_DELETE).
  const runner = entityMap[method];
  if (!runner) throw new Error(`Metodo no soportado para ${moduleName}: ${method}`);

  // Delega parametros estandarizados al caso de uso de la entidad correspondiente.
  return runner({
    moduleName,
    ...params,
    moduleRepository: params.moduleRepository,
    payloadText: params.payloadText,
    token: params.token,
    id: params.id,
    selectedIds: params.selectedIds,
    moduleFields: params.moduleFields,
  });
};

