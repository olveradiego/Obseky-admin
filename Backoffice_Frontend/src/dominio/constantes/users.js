/**
 * @filePurpose users.js
 * @description Constantes y reglas base de users (roles/status/form).
 */
/**
 * @function normalizeText
 * @description Ejecuta la logica asociada a 'normalize text' y retorna su resultado.
 */
const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]/g, "");

export const ROLE_KEYS = {
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
};

const ROLE_KEY_BY_NORMALIZED = {
  admin: ROLE_KEYS.ADMIN,
  administradordelaempresa: ROLE_KEYS.ADMIN,
  superadmin: ROLE_KEYS.SUPER_ADMIN,
  superadministrador: ROLE_KEYS.SUPER_ADMIN,
};

export const ROLE_LABEL_BY_KEY = {
  [ROLE_KEYS.ADMIN]: "Admin",
  [ROLE_KEYS.SUPER_ADMIN]: "SuperAdmin",
};

export const USERS_ROLE_OPTIONS = Object.values(ROLE_LABEL_BY_KEY);

/**
 * @function toRoleKey
 * @description Ejecuta la logica asociada a 'to role key' y retorna su resultado.
 */
export const toRoleKey = (value) => ROLE_KEY_BY_NORMALIZED[normalizeText(value)] || null;

/**
 * @function toRoleLabel
 * @description Ejecuta la logica asociada a 'to role label' y retorna su resultado.
 */
export const toRoleLabel = (value) => {
  const roleKey = toRoleKey(value);
  return roleKey ? ROLE_LABEL_BY_KEY[roleKey] : String(value || "").trim();
};

export const STATUS_KEYS = {
  ACTIVO: "ACTIVO",
  INACTIVO: "INACTIVO",
};

const STATUS_KEY_BY_NORMALIZED = {
  activo: STATUS_KEYS.ACTIVO,
  active: STATUS_KEYS.ACTIVO,
  inactivo: STATUS_KEYS.INACTIVO,
  inactive: STATUS_KEYS.INACTIVO,
};

export const STATUS_LABEL_BY_KEY = {
  [STATUS_KEYS.ACTIVO]: "Activo",
  [STATUS_KEYS.INACTIVO]: "Inactivo",
};

export const USERS_STATUS_OPTIONS = Object.values(STATUS_LABEL_BY_KEY);
export const USERS_STATUS_COMPAT_OPTIONS = ["Activo", "Inactivo", "Active", "Inactive"];
export const USERS_FORM_FIELDS = [
  { key: "companyName", label: "companyName", type: "text" },
  { key: "userName", label: "userName", type: "text" },
  { key: "email", label: "email", type: "email" },
  { key: "password", label: "password", type: "password" },
  { key: "restorePassword", label: "restorePassword", type: "number" },
  { key: "role", label: "role", type: "select", options: USERS_ROLE_OPTIONS },
  { key: "status", label: "status", type: "select", options: USERS_STATUS_OPTIONS },
];

export const USERS_DEFAULT_FORM = {
  companyName: "",
  userName: "",
  email: "",
  password: "",
  role: USERS_ROLE_OPTIONS[0],
  status: USERS_STATUS_OPTIONS[0],
  restorePassword: "",
};

/**
 * @function createUsersPatchFieldsDefault
 * @description Ejecuta la logica asociada a 'create users patch fields default' y retorna su resultado.
 */
export const createUsersPatchFieldsDefault = () =>
  USER_PATCH_ALLOWED_FIELDS_ARRAY.reduce((acc, field) => ({ ...acc, [field]: false }), {});

/**
 * @function toStatusKey
 * @description Ejecuta la logica asociada a 'to status key' y retorna su resultado.
 */
export const toStatusKey = (value) => STATUS_KEY_BY_NORMALIZED[normalizeText(value)] || null;

/**
 * @function toStatusLabel
 * @description Ejecuta la logica asociada a 'to status label' y retorna su resultado.
 */
export const toStatusLabel = (value) => {
  const statusKey = toStatusKey(value);
  return statusKey ? STATUS_LABEL_BY_KEY[statusKey] : String(value || "").trim();
};

const USER_PATCH_ALLOWED_FIELDS_ARRAY = [
  "name",
  "userName",
  "companyName",
  "email",
  "password",
  "role",
  "status",
  "isActive",
  "restorePassword",
];

export const USER_PATCH_ALLOWED_FIELDS = new Set(USER_PATCH_ALLOWED_FIELDS_ARRAY);

export const USER_PATCH_BLOCKED_FIELDS = new Set(["_id", "id", "createdAt", "updatedAt"]);
