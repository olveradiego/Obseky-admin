// Archivo: services/rolePermissionService.js
// Proposito: capa de servicio con reglas de negocio, validaciones y acceso a datos.

// Roles fijos del sistema de administradores.
const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
};

// Módulos protegidos por permisos.
const MODULES = {
  COMPANIES: "companies",
  CUSTOMERS: "customers",
  FINALCUSTOMERS: "finalcustomers",
  CODES: "codes",
  USERS: "users",
  EXPENSES: "expenses",
  ORDERS: "orders",
};

// Acciones CRUD disponibles por módulo.
const ALL_ACTIONS = ["create", "read", "update", "delete"];

// Matriz de permisos por rol y módulo.
const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    [MODULES.COMPANIES]: [...ALL_ACTIONS],
    [MODULES.CUSTOMERS]: [...ALL_ACTIONS],
    [MODULES.FINALCUSTOMERS]: [...ALL_ACTIONS],
    [MODULES.CODES]: [...ALL_ACTIONS],
    [MODULES.USERS]: [...ALL_ACTIONS],
    [MODULES.EXPENSES]: [...ALL_ACTIONS],
    [MODULES.ORDERS]: [...ALL_ACTIONS],
  },
  [ROLES.ADMIN]: {
    [MODULES.COMPANIES]: ["read", "update"],
    [MODULES.CUSTOMERS]: ["read", "update"],
    [MODULES.FINALCUSTOMERS]: ["read", "update"],
    [MODULES.CODES]: ["read", "create", "update"],
    [MODULES.EXPENSES]: ["read", "create", "update", "delete"],
    [MODULES.ORDERS]: ["read", "update"], // Solo ver y cambiar status a pagado
  },
};

// Valida si un string de rol pertenece al set oficial.
// Funcion 'isValidRole': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const isValidRole = (role) => Object.values(ROLES).includes(role);

// Normaliza variantes legacy de rol a formato oficial.
// Funcion 'normalizeRole': normaliza valores de entrada para mantener consistencia de contrato.
const normalizeRole = (role) => {
  if (!role) return null;
  const raw = String(role).trim();
  if (!raw) return null;

  const compact = raw.toLowerCase().replace(/[\s_-]/g, "");
  if (compact === "superadmin") return ROLES.SUPER_ADMIN;
  if (compact === "admin") return ROLES.ADMIN;
  if (compact === "administradordelaempresa") return ROLES.ADMIN;
  if (
    compact === "superadministradordelaempresa" ||
    compact === "superadministradordelsistema"
  ) {
    return ROLES.SUPER_ADMIN;
  }

  if (raw === "SUPER_ADMIN" || raw === "SuperAdmin") return ROLES.SUPER_ADMIN;
  if (raw === "ADMIN" || raw === "Admin") return ROLES.ADMIN;
  return null;
};

// Devuelve permisos del rol solicitado.
// Lanza error si el rol no es válido.
// Funcion 'getPermissionsByRole': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const getPermissionsByRole = (role) => {
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole || !isValidRole(normalizedRole)) {
    throw new Error("Rol invalido");
  }

  return ROLE_PERMISSIONS[normalizedRole];
};

// Evalúa si el rol puede ejecutar una acción sobre un módulo.
// Funcion 'hasModulePermission': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const hasModulePermission = (role, moduleName, action) => {
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole || !isValidRole(normalizedRole)) return false;

  const permissions = ROLE_PERMISSIONS[normalizedRole];
  if (!permissions || !permissions[moduleName]) return false;

  return permissions[moduleName].includes(action);
};

// Exporta catálogo de roles, módulos y helpers de autorización.
module.exports = {
  ROLES,
  MODULES,
  ROLE_PERMISSIONS,
  isValidRole,
  normalizeRole,
  getPermissionsByRole,
  hasModulePermission,
};
