/**
 * @filePurpose customerMappers.js
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
import {
  CUSTOMER_DEFAULT_FORM,
  normalizeCustomerOrderStatus,
  normalizeCustomerStatus,
} from "../../dominio/constantes/customers";

/**
 * @function normalizeString
 * @description Ejecuta la logica asociada a 'normalize string' y retorna su resultado.
 */
const normalizeString = (value) => String(value || "").trim();

/**
 * @function extractId
 * @description Ejecuta la logica asociada a 'extract id' y retorna su resultado.
 */
const extractId = (value) => {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    if (typeof value.$oid === "string") return value.$oid.trim();
    if (typeof value.id === "string") return value.id.trim();
    if (typeof value._id === "string") return value._id.trim();
  }
  return "";
};

/**
 * @function toCustomerDomain
 * @description Ejecuta la logica asociada a 'to customer domain' y retorna su resultado.
 */
export const toCustomerDomain = (apiItem = {}) => ({
  ...apiItem,
  id: extractId(apiItem.id) || extractId(apiItem._id),
  businessName: normalizeString(apiItem.businessName),
  customerName: normalizeString(apiItem.customerName),
  order: normalizeString(apiItem.order),
  cardId: normalizeString(apiItem.cardId),
  message: normalizeString(apiItem.message),
  images: normalizeString(apiItem.images),
  video: normalizeString(apiItem.video),
  secretCode: normalizeString(apiItem.secretCode),
  orderStatus: normalizeCustomerOrderStatus(apiItem.orderStatus),
  status: normalizeCustomerStatus(apiItem.status),
});

/**
 * @function toApiCreateCustomer
 * @description Ejecuta la logica asociada a 'to api create customer' y retorna su resultado.
 */
export const toApiCreateCustomer = (formData = {}) => ({
  businessName: normalizeString(formData.businessName),
  customerName: normalizeString(formData.customerName),
  order: normalizeString(formData.order),
  cardId: normalizeString(formData.cardId),
  message: normalizeString(formData.message),
  images: normalizeString(formData.images),
  video: normalizeString(formData.video),
  secretCode: normalizeString(formData.secretCode),
  orderStatus: normalizeCustomerOrderStatus(formData.orderStatus),
  status: normalizeCustomerStatus(formData.status),
});

/**
 * @function toApiUpdateCustomer
 * @description Ejecuta la logica asociada a 'to api update customer' y retorna su resultado.
 */
export const toApiUpdateCustomer = (formData = {}, patchFields = {}) => {
  const payload = {};
  for (const [key, enabled] of Object.entries(patchFields || {})) {
    if (!enabled) continue;
    if (key === "orderStatus") {
      payload.orderStatus = normalizeCustomerOrderStatus(formData.orderStatus);
      continue;
    }
    if (key === "status") {
      payload.status = normalizeCustomerStatus(formData.status);
      continue;
    }
    payload[key] = normalizeString(formData[key]);
  }
  return payload;
};

/**
 * @function toCustomerForm
 * @description Ejecuta la logica asociada a 'to customer form' y retorna su resultado.
 */
export const toCustomerForm = (domainCustomer = {}) => ({
  ...CUSTOMER_DEFAULT_FORM,
  businessName: normalizeString(domainCustomer.businessName),
  customerName: normalizeString(domainCustomer.customerName),
  order: normalizeString(domainCustomer.order),
  cardId: normalizeString(domainCustomer.cardId),
  message: normalizeString(domainCustomer.message),
  images: normalizeString(domainCustomer.images),
  video: normalizeString(domainCustomer.video),
  secretCode: normalizeString(domainCustomer.secretCode),
  orderStatus: normalizeCustomerOrderStatus(domainCustomer.orderStatus),
  status: normalizeCustomerStatus(domainCustomer.status),
});


