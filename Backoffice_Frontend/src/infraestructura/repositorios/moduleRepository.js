/**
 * @filePurpose moduleRepository.js
 * @description Repositorio CRUD de modulos usando endpoints dinamicos.
 *              TambiÃ©n incluye mÃ©todos para operaciones no CRUD como analÃ­ticas.
 */
import { createHttpClient } from "@/infraestructura/http/httpClient";
import { buildCrudPath } from "@/infraestructura/http/endpoints";

/**
 * @function resolvePath
 * @description Resuelve la ruta final de una operacion CRUD usando metadata o fallback por modulo.
 */
const resolvePath = ({ endpointCatalog, moduleName, operation, id = "" }) => {
  const endpointByOperation = endpointCatalog?.[moduleName] || {};
  const templatePath = endpointByOperation[operation] || "";
  if (!templatePath) {
    if (operation === "list" || operation === "create") return buildCrudPath({ moduleName });
    if (operation === "bulkDelete") return buildCrudPath({ moduleName, bulk: true });
    if (operation === "getById" || operation === "update" || operation === "remove") {
      return buildCrudPath({ moduleName, id });
    }
    return "";
  }
  if (!id) return templatePath;
  return templatePath.replace(":id", String(id));
};

const interpolatePath = (templatePath, params = {}) => {
  let result = String(templatePath || "");
  for (const [key, value] of Object.entries(params || {})) {
    result = result.replaceAll(`:${key}`, encodeURIComponent(String(value ?? "")));
  }
  return result;
};

/**
 * @function createModuleRepository
 * @description Crea el repositorio CRUD con operaciones HTTP estandarizadas para modulos.
 */
export const createModuleRepository = (apiBase, endpointCatalog = null) => {
  // Instancia cliente HTTP compartido para reutilizar manejo de token, timeout y errores.
  const httpClient = createHttpClient(apiBase);

  /**
   * @function list
   * @description Consulta el listado de registros del modulo.
   */
  const list = async ({ moduleName, token, queryParams = {} }) => {
    let path = resolvePath({ endpointCatalog, moduleName, operation: "list" });
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, value);
      }
    }
    const queryString = params.toString();
    if (queryString) {
      path += `?${queryString}`;
    }
    return httpClient.request({
      path,
      method: "GET",
      token,
      fallbackMessage: "No se pudo obtener la lista del modulo.",
    });
  };

  /**
   * @function getById
   * @description Consulta el detalle de un registro por ID.
   */
  const getById = async ({ moduleName, id, token }) =>
    httpClient.request({
      path: resolvePath({ endpointCatalog, moduleName, operation: "getById", id }),
      method: "GET",
      token,
      fallbackMessage: "No se pudo obtener el recurso solicitado.",
    });

  /**
   * @function create
   * @description Crea un nuevo registro en el modulo.
   */
  const create = async ({ moduleName, token, payload }) =>
    httpClient.request({
      path: resolvePath({ endpointCatalog, moduleName, operation: "create" }),
      method: "POST",
      token,
      body: payload,
      fallbackMessage: "No se pudo crear el registro.",
    });

  /**
   * @function update
   * @description Actualiza un registro existente por ID.
   */
  const update = async ({ moduleName, id, token, payload }) =>
    httpClient.request({
      path: resolvePath({ endpointCatalog, moduleName, operation: "update", id }),
      method: "PATCH",
      token,
      body: payload,
      fallbackMessage: "No se pudo actualizar el registro.",
    });

  /**
   * @function remove
   * @description Elimina un registro por ID.
   */
  const remove = async ({ moduleName, id, token }) =>
    httpClient.request({
      path: resolvePath({ endpointCatalog, moduleName, operation: "remove", id }),
      method: "DELETE",
      token,
      fallbackMessage: "No se pudo eliminar el registro.",
    });

  /**
   * @function bulkDelete
   * @description Elimina multiples registros enviando arreglo de IDs.
   */
  const bulkDelete = async ({ moduleName, ids, token }) =>
    httpClient.request({
      path: resolvePath({ endpointCatalog, moduleName, operation: "bulkDelete" }),
      method: "DELETE",
      token,
      body: { ids },
      fallbackMessage: "No se pudo completar la eliminacion masiva.",
    });

  const executeOperation = async ({
    moduleName,
    operation,
    method = "GET",
    token,
    params = {},
    payload,
    fallbackMessage = "No se pudo completar la operacion solicitada.",
  }) => {
    const endpointByOperation = endpointCatalog?.[moduleName] || {};
    const templatePath = endpointByOperation[operation] || "";
    const path = interpolatePath(templatePath, params);

    if (!path) {
      return {
        ok: false,
        status: 0,
        data: null,
        error: {
          status: 0,
          code: "ENDPOINT_MISSING",
          message: `No hay endpoint configurado para '${operation}' en '${moduleName}'.`,
          details: null,
        },
        response: null,
      };
    }

    return httpClient.request({
      path,
      method,
      token,
      body: payload,
      fallbackMessage,
    });
  };

  const executeBinaryOperation = async ({
    moduleName,
    operation,
    method = "GET",
    token,
    params = {},
    fallbackMessage = "No se pudo completar la descarga solicitada.",
  }) => {
    const endpointByOperation = endpointCatalog?.[moduleName] || {};
    const templatePath = endpointByOperation[operation] || "";
    const path = interpolatePath(templatePath, params);

    if (!path) {
      return {
        ok: false,
        status: 0,
        data: null,
        error: {
          status: 0,
          code: "ENDPOINT_MISSING",
          message: `No hay endpoint configurado para '${operation}' en '${moduleName}'.`,
          details: null,
        },
        response: null,
      };
    }

    return httpClient.requestBinary({
      path,
      method,
      token,
      fallbackMessage,
    });
  };

  /**
   * @function getCardStats
   * @description Obtiene estadÃ­sticas de tarjetas, opcionalmente filtradas por compaÃ±Ã­a.
   */
  const getCardStats = async ({ token, companyName = "", startDate = "", endDate = "" }) => {
    let path = `${buildCrudPath({ moduleName: "analytics" })}/card-stats`;
    const queryParams = [];
    if (companyName) {
      queryParams.push(`companyName=${encodeURIComponent(companyName)}`);
    }
    if (startDate) {
      queryParams.push(`startDate=${encodeURIComponent(startDate)}`);
    }
    if (endDate) {
      queryParams.push(`endDate=${encodeURIComponent(endDate)}`);
    }
    if (queryParams.length > 0) {
      path += `?${queryParams.join("&")}`;
    }
    return httpClient.request({
      path,
      method: "GET",
      token,
      fallbackMessage: "No se pudieron obtener las estadÃ­sticas de tarjetas.",
    });
  };

  /**
   * @function getFinancialSummary
   * @description Obtiene el resumen financiero, opcionalmente filtrado por compaÃ±Ã­a y rango de fechas.
   */
  const getFinancialSummary = async ({ token, companyName = "", startDate = "", endDate = "" }) => {
    let path = `${buildCrudPath({ moduleName: "analytics" })}/financial-summary`;
    const queryParams = [];
    if (companyName) {
      queryParams.push(`companyName=${encodeURIComponent(companyName)}`);
    }
    if (startDate) {
      queryParams.push(`startDate=${encodeURIComponent(startDate)}`);
    }
    if (endDate) {
      queryParams.push(`endDate=${encodeURIComponent(endDate)}`);
    }
    if (queryParams.length > 0) {
      path += `?${queryParams.join("&")}`;
    }
    return httpClient.request({
      path,
      method: "GET",
      token,
      fallbackMessage: "No se pudo obtener el resumen financiero.",
    });
  };

  /**
   * @function getExpensesByCategory
   * @description Obtiene los gastos desglosados por categorÃ­a, opcionalmente filtrados por compaÃ±Ã­a y rango de fechas.
   */
  const getExpensesByCategory = async ({ token, companyName = "", startDate = "", endDate = "" }) => {
    let path = `${buildCrudPath({ moduleName: "analytics" })}/expenses-by-category`;
    const queryParams = [];
    if (companyName) {
      queryParams.push(`companyName=${encodeURIComponent(companyName)}`);
    }
    if (startDate) {
      queryParams.push(`startDate=${encodeURIComponent(startDate)}`);
    }
    if (endDate) {
      queryParams.push(`endDate=${encodeURIComponent(endDate)}`);
    }
    if (queryParams.length > 0) {
      path += `?${queryParams.join("&")}`;
    }
    return httpClient.request({
      path,
      method: "GET",
      token,
      fallbackMessage: "No se pudieron obtener los gastos por categorÃ­a.",
    });
  };

  /**
   * @function updateOrderStatus
   * @description Actualiza el estado de pago de una orden.
   */
  const updateOrderStatus = async ({ id, token, paymentStatus }) => {
    return httpClient.request({
      path: `/admin/orders/${id}/status`,
      method: "PATCH",
      token,
      body: { paymentStatus },
      fallbackMessage: "No se pudo actualizar el estado de la orden.",
    });
  };


  return {
    list,
    getById,
    create,
    update,
    remove,
    bulkDelete,
    executeOperation,
    executeBinaryOperation, // Keep existing binary operation
    getCardStats, // Add the new analytics method
    getFinancialSummary, // Add the new financial summary method
    updateOrderStatus, // Add the new method for updating order status
    getExpensesByCategory, // Add the new expenses by category method
  };
};


