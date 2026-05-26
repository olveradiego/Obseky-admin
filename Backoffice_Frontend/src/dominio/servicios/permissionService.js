/**
 * @filePurpose permissionService.js
 * @description Servicio de reglas de permisos por rol/matriz y acciones.
 */
import { ROLE_KEYS, toRoleKey } from "../constantes/users";

/**
 * @function toPermissionEntries
 * @description Ejecuta la logica asociada a 'to permission entries' y retorna su resultado.
 */
export const toPermissionEntries = (permissions) => {
  if (!permissions) return [];
  return Object.entries(permissions).map(([moduleKey, actions]) => ({
    moduleKey,
    actions,
  }));
};

/**
 * @function normalize
 * @description Ejecuta la logica asociada a 'normalize' y retorna su resultado.
 */
const normalize = (value) => String(value || "").trim().toLowerCase();

const ACTION_ALIASES = {
  get: ["get", "read", "view", "list"],
  post: ["post", "create", "write", "add"],
  patch: ["patch", "update", "edit"],
  delete: ["delete", "remove"],
};

/**
 * @function isSuperAdminRole
 * @description Ejecuta la logica asociada a 'is super admin role' y retorna su resultado.
 */
export const isSuperAdminRole = (role) => toRoleKey(role) === ROLE_KEYS.SUPER_ADMIN;

/**
 * @function canRunByBackendPermissions
 * @description Ejecuta la logica asociada a 'can run by backend permissions' y retorna su resultado.
 */
const canRunByBackendPermissions = (permissions, moduleKey, method) => {
  if (!permissions || !permissions[moduleKey]) return false;
  const granted = permissions[moduleKey].map(normalize);
  const aliases = ACTION_ALIASES[normalize(method)] || [normalize(method)];
  return aliases.some((candidate) => granted.includes(candidate));
};

/**
 * @function canRunByRoleMatrix
 * @description Ejecuta la logica asociada a 'can run by role matrix' y retorna su resultado.
 */
const canRunByRoleMatrix = ({ role, permissionsMatrix, moduleKey, method }) => {
  const roleLabel = String(role || "").trim();
  const matrix = permissionsMatrix && typeof permissionsMatrix === "object" ? permissionsMatrix[roleLabel] : null;
  if (!matrix || !Array.isArray(matrix[moduleKey])) return false;
  const granted = matrix[moduleKey].map(normalize);
  const aliases = ACTION_ALIASES[normalize(method)] || [normalize(method)];
  return aliases.some((candidate) => granted.includes(candidate));
};

/**
 * @function canRunModuleMethod
 * @description Ejecuta la logica asociada a 'can run module method' y retorna su resultado.
 */
export const canRunModuleMethod = ({ role, permissions, permissionsMatrix, moduleKey, method }) => {
  if (isSuperAdminRole(role)) return true;
  if (canRunByBackendPermissions(permissions, moduleKey, method)) return true;
  return canRunByRoleMatrix({ role, permissionsMatrix, moduleKey, method });
};

/**
 * @function canAccessModule
 * @description Ejecuta la logica asociada a 'can access module' y retorna su resultado.
 */
export const canAccessModule = ({ role, permissions, permissionsMatrix, moduleKey }) => {
  if (isSuperAdminRole(role)) return true;
  if (canRunByBackendPermissions(permissions, moduleKey, "GET")) return true;
  return canRunByRoleMatrix({ role, permissionsMatrix, moduleKey, method: "GET" });
};

