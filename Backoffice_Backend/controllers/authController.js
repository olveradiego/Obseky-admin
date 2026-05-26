// Archivo: controllers/authController.js
// Proposito: controlador HTTP; transforma request/response y delega la logica de negocio.

const Admin = require("../models/Admin");
const { seedDefaultAdmins, loginAdmin, decodeToken } = require("../services/authService");
const {
  createAdmin,
  setAdminStatus,
  changeAdminPassword,
} = require("../services/userAdminService");
const {
  ROLES,
  getPermissionsByRole,
  hasModulePermission,
  isValidRole,
  normalizeRole,
} = require("../services/rolePermissionService");
const asyncHandler = require("../middleware/asyncHandler");
const { validationError, forbiddenError, notFoundError } = require("../lib/errorCatalog");
const { decodeAuthorization } = require("../lib/authz");

// Funcion 'requireSuperAdmin': verifica permisos/autorizacion antes de ejecutar la accion solicitada.
const requireSuperAdmin = (authorizationHeader) => {
  const actor = decodeAuthorization(authorizationHeader);
  if (actor.role !== ROLES.SUPER_ADMIN) {
    throw forbiddenError("Solo SUPER_ADMIN");
  }
  return actor;
};

// Funcion 'handleSeedAdmins': maneja una solicitud HTTP y coordina la respuesta del endpoint.
const handleSeedAdmins = asyncHandler(async (req, res) => {
  await seedDefaultAdmins();
  return res.json({
    message: "Admins de prueba asegurados",
    defaults: [
      {
        name: "SuperAdmin",
        email: process.env.DEFAULT_SUPERADMIN_EMAIL || "superadmin@test.local",
        password: process.env.DEFAULT_SUPERADMIN_PASSWORD || "admin1234",
        role: ROLES.SUPER_ADMIN,
      },
      {
        name: "Admin",
        email: process.env.DEFAULT_ADMIN_EMAIL || "admin@test.local",
        password: process.env.DEFAULT_ADMIN_PASSWORD || "admin1234",
        role: ROLES.ADMIN,
      },
    ],
  });
});

// Funcion 'handleCreateAdmin': maneja una solicitud HTTP y coordina la respuesta del endpoint.
const handleCreateAdmin = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.headers.authorization);
  const { name, email, password, role } = req.body || {};
  const created = await createAdmin({ name, email, password, role });
  return res.status(201).json({
    message: "Admin creado",
    admin: {
      id: created._id,
      name: created.userName || created.name || created.companyName || "Admin",
      email: created.email,
      role: normalizeRole(created.role),
      isActive:
        created.status === "Active" || created.status === "Activo" || created.isActive === true,
    },
  });
});

// Funcion 'handleLoginAdmin': maneja una solicitud HTTP y coordina la respuesta del endpoint.
const handleLoginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    throw validationError("email y password son obligatorios");
  }
  const result = await loginAdmin(email, password);
  return res.json(result);
});

// Funcion 'handleMe': maneja una solicitud HTTP y coordina la respuesta del endpoint.
const handleMe = asyncHandler(async (req, res) => {
  const decoded = decodeToken(req.headers.authorization);
  const admin = await Admin.findById(decoded.adminId).select(
    "name userName companyName email role status isActive"
  );
  if (!admin) {
    throw notFoundError("Administrador no encontrado");
  }

  const role = normalizeRole(admin.role) || decoded.role;
  const isActive = admin.status === "Active" || admin.status === "Activo" || admin.isActive === true;
  const name = admin.userName || admin.name || admin.companyName || decoded.name;

  return res.json({
    admin: {
      id: admin._id,
      name,
      email: admin.email,
      role,
      isActive,
      source: "users",
    },
    permissions: getPermissionsByRole(role),
  });
});

// Funcion 'handleAdminOnly': maneja una solicitud HTTP y coordina la respuesta del endpoint.
const handleAdminOnly = asyncHandler(async (req, res) => {
  const decoded = decodeAuthorization(req.headers.authorization);
  if (decoded.role !== ROLES.ADMIN && decoded.role !== ROLES.SUPER_ADMIN) {
    throw forbiddenError("No autorizado");
  }
  return res.json({ message: "Acceso concedido a Admin/SuperAdmin", actor: decoded.name });
});

// Funcion 'handleSuperAdminOnly': maneja una solicitud HTTP y coordina la respuesta del endpoint.
const handleSuperAdminOnly = asyncHandler(async (req, res) => {
  const decoded = decodeAuthorization(req.headers.authorization);
  if (decoded.role !== ROLES.SUPER_ADMIN) {
    throw forbiddenError("Solo SUPER_ADMIN");
  }
  return res.json({ message: "Acceso concedido a SUPER_ADMIN", actor: decoded.name });
});

// Funcion 'handleSetAdminStatus': maneja una solicitud HTTP y coordina la respuesta del endpoint.
const handleSetAdminStatus = asyncHandler(async (req, res) => {
  requireSuperAdmin(req.headers.authorization);
  const { adminId } = req.params;
  const { isActive } = req.body || {};
  if (typeof isActive !== "boolean") {
    throw validationError("isActive debe ser boolean", { field: "isActive", value: isActive });
  }
  const updated = await setAdminStatus({ adminId, isActive });
  const updatedRole = normalizeRole(updated.role);
  const updatedName = updated.userName || updated.name || updated.companyName || "Admin";
  return res.json({
    message: "Estado de admin actualizado",
    admin: {
      id: updated._id,
      name: updatedName,
      email: updated.email,
      role: updatedRole,
      isActive:
        updated.status === "Active" || updated.status === "Activo" || updated.isActive === true,
    },
  });
});

// Funcion 'handleChangePassword': maneja una solicitud HTTP y coordina la respuesta del endpoint.
const handleChangePassword = asyncHandler(async (req, res) => {
  const decoded = decodeAuthorization(req.headers.authorization);
  const { adminId } = req.params;
  const { newPassword } = req.body || {};
  const isSelfChange = decoded.adminId === adminId;
  const isSuperAdmin = decoded.role === ROLES.SUPER_ADMIN;
  if (!isSelfChange && !isSuperAdmin) {
    throw forbiddenError("No autorizado para cambiar esta password");
  }

  const updated = await changeAdminPassword({ adminId, newPassword });
  const updatedName = updated.userName || updated.name || updated.companyName || "Admin";
  return res.json({
    message: "Password actualizada",
    admin: {
      id: updated._id,
      name: updatedName,
      email: updated.email,
    },
  });
});

// Funcion 'handleRolePermissions': maneja una solicitud HTTP y coordina la respuesta del endpoint.
const handleRolePermissions = asyncHandler(async (req, res) => {
  const normalizedRole = normalizeRole(req.params.role);
  if (!normalizedRole || !isValidRole(normalizedRole)) {
    throw validationError("Rol invalido");
  }
  return res.json({
    role: normalizedRole,
    permissions: getPermissionsByRole(normalizedRole),
  });
});

// Funcion 'handlePermissionCheck': maneja una solicitud HTTP y coordina la respuesta del endpoint.
const handlePermissionCheck = asyncHandler(async (req, res) => {
  const decoded = decodeAuthorization(req.headers.authorization);
  const { moduleName, action } = req.query;
  if (!moduleName || !action) {
    throw validationError("moduleName y action son obligatorios");
  }
  const allowed = hasModulePermission(decoded.role, moduleName, action);
  return res.json({
    role: decoded.role,
    moduleName,
    action,
    allowed,
  });
});

// Funcion 'handleDbCheck': maneja una solicitud HTTP y coordina la respuesta del endpoint.
const handleDbCheck = asyncHandler(async (req, res) => {
  const count = await Admin.countDocuments({});
  return res.json({
    connected: true,
    database: Admin.db.name,
    collection: Admin.collection.name,
    totalUsers: count,
  });
});

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = {
  handleSeedAdmins,
  handleCreateAdmin,
  handleLoginAdmin,
  handleMe,
  handleAdminOnly,
  handleSuperAdminOnly,
  handleSetAdminStatus,
  handleChangePassword,
  handleRolePermissions,
  handlePermissionCheck,
  handleDbCheck,
};


