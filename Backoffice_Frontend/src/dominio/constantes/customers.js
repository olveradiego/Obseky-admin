/**
 * @filePurpose customers.js
 * @description Constantes y defaults de customers.
 */
export const CUSTOMER_STATUS_OPTIONS = ["Active", "Inactive"];
export const CUSTOMER_ORDER_STATUS_OPTIONS = ["OK"];

/**
 * @function normalizeText
 * @description Ejecuta la logica asociada a 'normalize text' y retorna su resultado.
 */
const normalizeText = (value) => String(value || "").trim();
/**
 * @function normalizeKey
 * @description Ejecuta la logica asociada a 'normalize key' y retorna su resultado.
 */
const normalizeKey = (value) => normalizeText(value).toLowerCase();

const STATUS_BY_KEY = {
  active: "Active",
  inactive: "Inactive",
};

const ORDER_STATUS_BY_KEY = {
  ok: "OK",
};

/**
 * @function normalizeCustomerStatus
 * @description Ejecuta la logica asociada a 'normalize customer status' y retorna su resultado.
 */
export const normalizeCustomerStatus = (value) => {
  const normalized = STATUS_BY_KEY[normalizeKey(value)];
  return normalized || CUSTOMER_STATUS_OPTIONS[0];
};

/**
 * @function normalizeCustomerOrderStatus
 * @description Ejecuta la logica asociada a 'normalize customer order status' y retorna su resultado.
 */
export const normalizeCustomerOrderStatus = (value) => {
  const normalized = ORDER_STATUS_BY_KEY[normalizeKey(value)];
  return normalized || CUSTOMER_ORDER_STATUS_OPTIONS[0];
};

export const CUSTOMER_MUTABLE_FIELDS = [
  "businessName",
  "customerName",
  "order",
  "cardId",
  "message",
  "images",
  "video",
  "secretCode",
  "orderStatus",
  "status",
];

export const CUSTOMER_CREATE_ALLOWED_FIELDS = new Set(CUSTOMER_MUTABLE_FIELDS);
export const CUSTOMER_PATCH_ALLOWED_FIELDS = new Set(CUSTOMER_MUTABLE_FIELDS);
export const CUSTOMER_PATCH_BLOCKED_FIELDS = new Set([
  "_id",
  "id",
  "createdAt",
  "updatedAt",
  "__v",
]);

export const CUSTOMER_FORM_FIELDS = [
  { key: "businessName", label: "businessName", type: "text" },
  { key: "customerName", label: "customerName", type: "text" },
  { key: "order", label: "order", type: "text" },
  { key: "cardId", label: "cardId", type: "text" },
  { key: "message", label: "message", type: "text" },
  { key: "images", label: "images", type: "text" },
  { key: "video", label: "video", type: "text" },
  { key: "secretCode", label: "secretCode", type: "text" },
  {
    key: "orderStatus",
    label: "orderStatus",
    type: "select",
    options: CUSTOMER_ORDER_STATUS_OPTIONS,
  },
  {
    key: "status",
    label: "status",
    type: "select",
    options: CUSTOMER_STATUS_OPTIONS,
  },
];

export const CUSTOMER_DEFAULT_FORM = {
  businessName: "",
  customerName: "",
  order: "",
  cardId: "",
  message: "",
  images: "",
  video: "",
  secretCode: "",
  orderStatus: CUSTOMER_ORDER_STATUS_OPTIONS[0],
  status: CUSTOMER_STATUS_OPTIONS[0],
};

/**
 * @function createCustomerPatchFieldsDefault
 * @description Ejecuta la logica asociada a 'create customer patch fields default' y retorna su resultado.
 */
export const createCustomerPatchFieldsDefault = () =>
  CUSTOMER_MUTABLE_FIELDS.reduce((acc, field) => ({ ...acc, [field]: false }), {});

export const CUSTOMER_DEFAULT_PAYLOAD = {
  businessName: "Empresa demo",
  customerName: "Cliente demo",
  order: "",
  cardId: "",
  message: "",
  images: "",
  video: "",
  secretCode: "",
  orderStatus: CUSTOMER_ORDER_STATUS_OPTIONS[0],
  status: CUSTOMER_STATUS_OPTIONS[0],
};

