// Archivo: services/metaService.js
// Proposito: capa de servicio con reglas de negocio, validaciones y acceso a datos.

const { decodeAuthorization } = require("@/lib/authz");
const { ROLES, ROLE_PERMISSIONS, MODULES } = require("@/services/rolePermissionService");
const { unauthorizedError, forbiddenError } = require("@/lib/errorCatalog");
const Company = require("@/models/Company");
const FinalCustomer = require("@/models/FinalCustomer");
const CardCode = require("@/models/CardCode");
const Order = require("@/models/Order");
const Expense = require("@/models/Expense");

const ACTION_TO_HTTP = {
  read: "GET",
  create: "POST",
  update: "PATCH",
  delete: "DELETE",
};

// Funcion 'mapPermissionActionsToHttp': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const mapPermissionActionsToHttp = (actions = []) => {
// Catalogo de valores permitidos o lista de referencia para validacion y control de flujo.
  const ordered = ["read", "create", "update", "delete"];
// Catalogo de valores permitidos o lista de referencia para validacion y control de flujo.
  const result = [];
  for (const action of ordered) {
    if (actions.includes(action)) {
      result.push(ACTION_TO_HTTP[action]);
    }
  }
  return result;
};

// Funcion 'buildPermissionsMatrix': construye estructura/objeto estandar para respuestas o configuracion.
const buildPermissionsMatrix = () => {
// Funcion 'toLabel': mapea/convierte datos entre formatos internos y externos del sistema.
  const toLabel = (role) => (role === ROLES.SUPER_ADMIN ? "SuperAdmin" : "Admin");
  const matrix = {};

  for (const [roleKey, modulePermissions] of Object.entries(ROLE_PERMISSIONS)) {
    const roleLabel = toLabel(roleKey);
    matrix[roleLabel] = {
      companies: mapPermissionActionsToHttp(modulePermissions[MODULES.COMPANIES] || []),
      customers: mapPermissionActionsToHttp(modulePermissions[MODULES.CUSTOMERS] || []),
      finalcustomers: mapPermissionActionsToHttp(modulePermissions[MODULES.FINALCUSTOMERS] || []),
      codes: mapPermissionActionsToHttp(modulePermissions[MODULES.CODES] || []),
      expenses: mapPermissionActionsToHttp(modulePermissions[MODULES.EXPENSES] || []),
      orders: mapPermissionActionsToHttp(modulePermissions[MODULES.ORDERS] || []),
    };

    if (modulePermissions[MODULES.USERS]) {
      matrix[roleLabel].users = mapPermissionActionsToHttp(modulePermissions[MODULES.USERS]);
    }
  }

  return matrix;
};

// Funcion 'inferType': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const inferType = (value) => {
  if (Array.isArray(value)) return "array";
  if (value === null) return "string";
  const t = typeof value;
  if (t === "number") return "number";
  if (t === "boolean") return "boolean";
  if (t === "object") return "object";
  return "string";
};

// Funcion 'toFieldMeta': mapea/convierte datos entre formatos internos y externos del sistema.
const toFieldMeta = (key, value) => ({
  key,
  type: inferType(value),
  required: false,
  mutable: true,
});

// Funcion 'inferFieldsFromSample': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const inferFieldsFromSample = async (Model) => {
  const sample = await Model.findOne({}).sort({ createdAt: -1 }).lean();
  if (!sample) return [];

  return Object.keys(sample)
    .filter((key) => !["_id", "__v", "createdAt", "updatedAt"].includes(key))
    .map((key) => toFieldMeta(key, sample[key]));
};

// Catalogo de valores permitidos o lista de referencia para validacion y control de flujo.
const MODULE_META_BASE = [
  {
    key: "companies",
    resource: "companies",
    endpoints: {
      list: "/api/admin/companies",
      getById: "/api/admin/companies/:id",
      create: "/api/admin/companies",
      update: "/api/admin/companies/:id",
      delete: "/api/admin/companies/:id",
      bulkDelete: "/api/admin/companies/bulk",
    },
    fields: null,
  },
  {
    key: "customers",
    resource: "customers",
    endpoints: {
      list: "/api/admin/customers",
      getById: "/api/admin/customers/:id",
      create: "/api/admin/customers",
      update: "/api/admin/customers/:id",
      delete: "/api/admin/customers/:id",
      bulkDelete: "/api/admin/customers/bulk",
    },
    fields: [
      { key: "businessName", type: "string", required: false, mutable: true },
      { key: "customerName", type: "string", required: false, mutable: true },
      { key: "order", type: "string", required: false, mutable: true },
      { key: "cardId", type: "string", required: false, mutable: true },
      { key: "message", type: "string", required: false, mutable: true },
      { key: "images", type: "string", required: false, mutable: true },
      { key: "video", type: "string", required: false, mutable: true },
      { key: "secretCode", type: "string", required: false, mutable: true },
      { key: "orderStatus", type: "enum", values: ["OK"], required: false, mutable: true },
      {
        key: "status",
        type: "enum",
        values: ["Active", "Inactive"],
        required: false,
        mutable: true,
      },
    ],
  },
  {
    key: "finalcustomers",
    resource: "finalcustomers",
    endpoints: {
      list: "/api/admin/finalcustomers",
      getById: "/api/admin/finalcustomers/:id",
      create: "/api/admin/finalcustomers",
      update: "/api/admin/finalcustomers/:id",
      delete: "/api/admin/finalcustomers/:id",
      bulkDelete: "/api/admin/finalcustomers/bulk",
    },
    fields: null,
  },
  {
    key: "cardcodes",
    resource: "codes",
    endpoints: {
      list: "/api/admin/codes",
      getById: "/api/admin/codes/:id",
      create: "/api/admin/codes",
      update: "/api/admin/codes/:id",
      delete: "/api/admin/codes/:id",
      bulkDelete: "/api/admin/codes/bulk",
      generateQr: "/api/admin/codes/generate/:numCodes/:purchaseType",
      generatePdf: "/api/admin/codes/pdf/:num",
      validateCard: "/api/admin/codes/validate/:id",
    },
    fields: null,
  },
  {
    key: "users",
    resource: "users",
    endpoints: {
      list: "/api/admin/users",
      getById: "/api/admin/users/:id",
      create: "/api/admin/users",
      update: "/api/admin/users/:id",
      delete: "/api/admin/users/:id",
      bulkDelete: "/api/admin/users/bulk",
    },
    fields: [
      { key: "companyName", type: "string", required: true, mutable: true },
      { key: "userName", type: "string", required: true, mutable: true },
      { key: "email", type: "string", required: true, mutable: true },
      {
        key: "role",
        type: "enum",
        values: ["Admin", "SuperAdmin"],
        required: true,
        mutable: true,
      },
      {
        key: "status",
        type: "enum",
        values: ["Activo", "Inactivo"],
        required: false,
        mutable: true,
      },
      { key: "password", type: "string", required: true, mutable: true },
    ],
  },
  {
    key: "expenses",
    resource: "expenses",
    endpoints: {
      list: "/api/admin/expenses",
      getById: "/api/admin/expenses/:id",
      create: "/api/admin/expenses",
      update: "/api/admin/expenses/:id",
      delete: "/api/admin/expenses/:id",
    },
    fields: null,
  },
  {
    key: "orders",
    resource: "orders",
    endpoints: {
      list: "/api/admin/orders",
      getById: "/api/admin/orders/:id",
      // La creación de órdenes es automática al generar lotes de tarjetas.
      // No hay un endpoint de 'create' directo para órdenes.
      // La actualización es solo para el estado de pago.
      update: "/api/admin/orders/:id/status",
      delete: "/api/admin/orders/:id",
    },
    fields: null,
  },
];

// Funcion 'getMeta': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const getMeta = async ({ authorizationHeader }) => {
  const actor = decodeAuthorization(authorizationHeader);
  if (!actor?.role) {
    throw unauthorizedError("Token ausente o invalido");
  }
  const roleCompact = String(actor.role).toLowerCase().replace(/[\s_-]/g, "");
  if (roleCompact !== "admin" && roleCompact !== "superadmin") {
    throw forbiddenError("Rol no permitido para metadata");
  }

  const inferredCompaniesFields = await inferFieldsFromSample(Company);
  const inferredFinalCustomersFields = await inferFieldsFromSample(FinalCustomer);
  const inferredCodesFields = await inferFieldsFromSample(CardCode);
  const inferredExpensesFields = await inferFieldsFromSample(Expense);
  const inferredOrdersFields = await inferFieldsFromSample(Order);

  const modules = MODULE_META_BASE.map((module) => {
    if (module.key === "companies") {
      return { ...module, fields: inferredCompaniesFields };
    }
    if (module.key === "finalcustomers") {
      return { ...module, fields: inferredFinalCustomersFields };
    }
    if (module.key === "cardcodes") {
      return { ...module, fields: inferredCodesFields };
    }
    if (module.key === "expenses") {
      return { ...module, fields: inferredExpensesFields };
    }
    if (module.key === "orders") {
      return { ...module, fields: inferredOrdersFields };
    }
    return module;
  });

  return {
    version: "v1",
    modules,
    enums: {
      users: {
        role: ["Admin", "SuperAdmin"],
        status: ["Activo", "Inactivo"],
      },
      customers: {
        status: ["Active", "Inactive"],
        orderStatus: ["OK"],
      },
      codes: {
        status: ["Activo", "Inactivo", "Active", "Inactive"],
      },
      expenses: {
        paymentStatus: ["pending", "paid"],
      },
      orders: {
        paymentStatus: ["pending", "paid"],
      },
    },
    permissionsMatrix: buildPermissionsMatrix(),
  };
};

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = {
  getMeta,
};
