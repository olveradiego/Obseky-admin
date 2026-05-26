/**
 * @filePurpose customerRules.js
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
import {
  CUSTOMER_CREATE_ALLOWED_FIELDS,
  CUSTOMER_ORDER_STATUS_OPTIONS,
  CUSTOMER_PATCH_ALLOWED_FIELDS,
  CUSTOMER_PATCH_BLOCKED_FIELDS,
  CUSTOMER_STATUS_OPTIONS,
} from "../constantes/customers";

/**
 * @function isObject
 * @description Ejecuta la logica asociada a 'is object' y retorna su resultado.
 */
const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * @function isValidString
 * @description Ejecuta la logica asociada a 'is valid string' y retorna su resultado.
 */
const isValidString = (value) => typeof value === "string";

/**
 * @function validateCustomerTextFields
 * @description Ejecuta la logica asociada a 'validate customer text fields' y retorna su resultado.
 */
const validateCustomerTextFields = (payload) => {
  const textFields = [
    "businessName",
    "customerName",
    "order",
    "cardId",
    "message",
    "images",
    "video",
    "secretCode",
  ];

  for (const field of textFields) {
    if (payload[field] !== undefined && !isValidString(payload[field])) {
      return `El campo '${field}' debe ser string.`;
    }
  }

  return "";
};

/**
 * @function sanitizeCustomerPayload
 * @description Ejecuta la logica asociada a 'sanitize customer payload' y retorna su resultado.
 */
export const sanitizeCustomerPayload = ({ payload, method }) => {
  const sanitized = {};
  const unknownKeys = [];
  const blockedKeys = [];

  const allowedFields =
    method === "POST" ? CUSTOMER_CREATE_ALLOWED_FIELDS : CUSTOMER_PATCH_ALLOWED_FIELDS;

  for (const [key, value] of Object.entries(payload || {})) {
    if (CUSTOMER_PATCH_BLOCKED_FIELDS.has(key)) {
      blockedKeys.push(key);
      continue;
    }
    if (!allowedFields.has(key)) {
      unknownKeys.push(key);
      continue;
    }
    sanitized[key] = value;
  }

  return { sanitized, unknownKeys, blockedKeys };
};

/**
 * @function validateCustomerPayload
 * @description Ejecuta la logica asociada a 'validate customer payload' y retorna su resultado.
 */
export const validateCustomerPayload = ({ method, id, payload, unknownKeys = [], blockedKeys = [] }) => {
  if (!isObject(payload)) return "El payload de customers debe ser un objeto.";

  if (blockedKeys.length > 0) {
    return `Campos bloqueados para customers: ${blockedKeys.join(", ")}.`;
  }

  if (unknownKeys.length > 0) {
    return `Campos no permitidos para customers: ${unknownKeys.join(", ")}.`;
  }

  if (method === "PATCH" && !String(id || "").trim()) {
    return "El campo ID es obligatorio para PATCH.";
  }

  if (method === "PATCH" && Object.keys(payload).length === 0) {
    return "El payload para PATCH debe incluir al menos un campo a actualizar.";
  }

  const textFieldError = validateCustomerTextFields(payload);
  if (textFieldError) return textFieldError;

  if (
    payload.orderStatus !== undefined &&
    !CUSTOMER_ORDER_STATUS_OPTIONS.includes(payload.orderStatus)
  ) {
    return `El campo 'orderStatus' debe ser uno de: ${CUSTOMER_ORDER_STATUS_OPTIONS.join(", ")}.`;
  }

  if (payload.status !== undefined && !CUSTOMER_STATUS_OPTIONS.includes(payload.status)) {
    return `El campo 'status' debe ser uno de: ${CUSTOMER_STATUS_OPTIONS.join(", ")}.`;
  }

  return "";
};


