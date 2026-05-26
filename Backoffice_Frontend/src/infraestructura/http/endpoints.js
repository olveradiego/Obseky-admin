/**
 * @filePurpose endpoints.js
 * @description Catalogo base de endpoints y helpers de rutas.
 */
export const API_PREFIX = "/api/admin";

export const RESOURCE_ENDPOINT_BY_MODULE = {
  companies: "companies",
  customers: "customers",
  finalcustomers: "finalcustomers",
  cardcodes: "codes",
  users: "users",
};

export const ENDPOINTS = {
  auth: {
    login: `${API_PREFIX}/auth/login`,
    me: `${API_PREFIX}/auth/me`,
    meta: `${API_PREFIX}/meta`,
  },
};

/**
 * @function resolveResourceName
 * @description Traduce la clave de modulo UI a recurso backend (incluye alias cardcodes->codes).
 */
export const resolveResourceName = (moduleName) =>
  RESOURCE_ENDPOINT_BY_MODULE[moduleName] || String(moduleName || "").trim();

/**
 * @function buildCrudPath
 * @description Genera rutas CRUD base con soporte para detalle por ID y eliminacion masiva.
 */
export const buildCrudPath = ({ moduleName, id = "", bulk = false }) => {
  const resourceName = resolveResourceName(moduleName);
  const base = `${API_PREFIX}/${resourceName}`;
  if (bulk) return `${base}/bulk`;
  if (id) return `${base}/${id}`;
  return base;
};
