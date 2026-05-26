/**
 * @filePurpose crudResponseAdapter.js
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
import { toCustomerDomain } from "../mapeadores/customerMappers";
import { toDomainUser } from "../mapeadores/userMappers";
import { MODULE_KEYS } from "../../dominio/constantes/modules";

/**
 * @function isObject
 * @description Ejecuta la logica asociada a 'is object' y retorna su resultado.
 */
const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * @function extractArray
 * @description Ejecuta la logica asociada a 'extract array' y retorna su resultado.
 */
const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.users)) return data.users;
  return null;
};

/**
 * @function extractItem
 * @description Ejecuta la logica asociada a 'extract item' y retorna su resultado.
 */
const extractItem = (data) => {
  if (isObject(data?.item)) return data.item;
  if (isObject(data?.data)) return data.data;
  if (isObject(data?.record)) return data.record;
  if (isObject(data?.result)) return data.result;
  if (isObject(data)) return data;
  return null;
};

/**
 * @function extractId
 * @description Ejecuta la logica asociada a 'extract id' y retorna su resultado.
 */
const extractId = (value) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    if (typeof value.$oid === "string") return value.$oid.trim();
    if (typeof value.id === "string") return value.id.trim();
    if (typeof value._id === "string") return value._id.trim();
  }
  return "";
};

/**
 * @function normalizeItem
 * @description Ejecuta la logica asociada a 'normalize item' y retorna su resultado.
 */
const normalizeItem = (moduleName, item) => {
  if (moduleName === MODULE_KEYS.USERS) return toDomainUser(item);
  if (moduleName === MODULE_KEYS.CUSTOMERS) return toCustomerDomain(item);
  return item;
};

/**
 * @function getTotal
 * @description Ejecuta la logica asociada a 'get total' y retorna su resultado.
 */
const getTotal = (data, items) => {
  if (typeof data?.total === "number") return data.total;
  if (typeof data?.count === "number") return data.count;
  if (typeof data?.totalCount === "number") return data.totalCount;
  return items.length;
};

/**
 * @function normalizeList
 * @description Ejecuta la logica asociada a 'normalize list' y retorna su resultado.
 */
const normalizeList = ({ moduleName, data }) => {
  const rawItems = extractArray(data);
  if (!rawItems) return null;
  /**
   * @function items
   * @description Ejecuta la logica asociada a 'items' y retorna su resultado.
   */
  const items = rawItems.map((item) => normalizeItem(moduleName, item));
  return {
    items,
    total: getTotal(data, items),
  };
};

/**
 * @function normalizeSingle
 * @description Ejecuta la logica asociada a 'normalize single' y retorna su resultado.
 */
const normalizeSingle = ({ moduleName, data, messageFallback }) => {
  const rawItem = extractItem(data);
  if (!rawItem) return null;
  return {
    item: normalizeItem(moduleName, rawItem),
    message: String(data?.message || messageFallback),
  };
};

/**
 * @function normalizeDelete
 * @description Ejecuta la logica asociada a 'normalize delete' y retorna su resultado.
 */
const normalizeDelete = ({ data, id }) => {
  const deletedId =
    extractId(data?.item?.id) ||
    extractId(data?.item?._id) ||
    extractId(data?.deletedId) ||
    extractId(id);

  if (!deletedId) return null;
  return {
    item: { id: deletedId },
    message: String(data?.message || "Registro eliminado."),
  };
};

/**
 * @function normalizeBulkDelete
 * @description Ejecuta la logica asociada a 'normalize bulk delete' y retorna su resultado.
 */
const normalizeBulkDelete = ({ data, selectedIds = [] }) => {
  const deletedIds = Array.isArray(data?.deletedIds) ? data.deletedIds.map(extractId).filter(Boolean) : [];
  const notFoundIds = Array.isArray(data?.notFoundIds) ? data.notFoundIds.map(extractId).filter(Boolean) : [];

  const requestedCount =
    typeof data?.requestedCount === "number"
      ? data.requestedCount
      : Array.isArray(selectedIds)
      ? selectedIds.length
      : 0;

  const deletedCount =
    typeof data?.deletedCount === "number" ? data.deletedCount : deletedIds.length;

  const nextNotFoundCount =
    typeof data?.notFoundCount === "number" ? data.notFoundCount : notFoundIds.length;

  return {
    item: { ids: deletedIds },
    message: String(data?.message || "Eliminacion masiva completada."),
    requestedCount,
    deletedCount,
    deletedIds,
    notFoundCount: nextNotFoundCount,
    notFoundIds,
  };
};

export const normalizeCrudResponse = ({
  method,
  moduleName,
  hasId,
  data,
  id = "",
  selectedIds = [],
}) => {
  if (method === "GET" && !hasId) {
    const normalized = normalizeList({ moduleName, data });
    return normalized
      ? { ok: true, data: normalized }
      : { ok: false, message: "La respuesta de listado no contiene items validos." };
  }

  if (method === "GET" && hasId) {
    const normalized = normalizeSingle({
      moduleName,
      data,
      messageFallback: "Detalle obtenido.",
    });
    return normalized
      ? { ok: true, data: { item: normalized.item } }
      : { ok: false, message: "La respuesta de detalle no contiene un item valido." };
  }

  if (method === "POST" || method === "PATCH") {
    const normalized = normalizeSingle({
      moduleName,
      data,
      messageFallback: method === "POST" ? "Registro creado." : "Registro actualizado.",
    });
    return normalized
      ? { ok: true, data: normalized }
      : { ok: false, message: `La respuesta de ${method} no contiene un item valido.` };
  }

  if (method === "DELETE") {
    const normalized = normalizeDelete({ data, id });
    return normalized
      ? { ok: true, data: normalized }
      : { ok: false, message: "La respuesta de DELETE no contiene un id valido." };
  }

  if (method === "BULK_DELETE") {
    return { ok: true, data: normalizeBulkDelete({ data, selectedIds }) };
  }

  return { ok: false, message: "Metodo no soportado." };
};

