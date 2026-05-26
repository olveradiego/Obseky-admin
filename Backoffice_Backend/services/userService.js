// Archivo: services/userService.js
// Proposito: capa de servicio con reglas de negocio, validaciones y acceso a datos.

// Modelo de administradores almacenado en la coleccion "users".
const mongoose = require("mongoose");
const Admin = require("@/models/Admin");
// Utilidades para hash seguro de passwords.
const { hashPassword } = require("@/services/userAdminService");
// Helpers de roles para normalizar valores legacy/nuevos.
const { ROLES, normalizeRole } = require("@/services/rolePermissionService");

const MIN_NAME_LENGTH = 2;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STORED_ROLE_ADMIN = "Admin";
const STORED_ROLE_SUPER_ADMIN = "SuperAdmin";
const STATUS_ACTIVE = "Activo";
const STATUS_INACTIVE = "Inactivo";
const SAFE_SELECT =
  "companyName userName email role status restorePassword createdAt updatedAt";
// Catalogo de valores permitidos o lista de referencia para validacion y control de flujo.
const ALLOWED_PATCH_FIELDS = [
  "name",
  "userName",
  "companyName",
  "email",
  "password",
  "role",
  "status",
  "isActive",
];
// Catalogo de valores permitidos o lista de referencia para validacion y control de flujo.
const BLOCKED_PATCH_FIELDS = ["_id", "id", "createdAt", "updatedAt", "restorePassword"];

// Funcion 'buildError': construye estructura/objeto estandar para respuestas o configuracion.
const buildError = (status, code, message, details) => {
  const error = new Error(message);
  error.statusCode = status;
  error.code = code;
  if (details !== undefined) error.details = details;
  return error;
};

// Funcion 'normalizeEmail': normaliza valores de entrada para mantener consistencia de contrato.
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

// Funcion 'validateObjectId': valida precondiciones de entrada y lanza errores de contrato cuando corresponde.
const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw buildError(400, "VALIDATION_ERROR", "id debe ser un ObjectId valido", {
      field: "id",
      value: id,
    });
  }
};

// Funcion 'normalizeAndValidateRole': normaliza valores de entrada para mantener consistencia de contrato.
const normalizeAndValidateRole = (role) => {
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole) {
    throw buildError(400, "VALIDATION_ERROR", "role invalido", {
      field: "role",
      accepted: [
        "ADMIN",
        "SUPER_ADMIN",
        "Admin",
        "SuperAdmin",
        "Administrador de la empresa",
        "Super Administrador de la empresa",
        "admin",
        "superadmin",
        "super_admin",
        "super-admin",
      ],
    });
  }
  return normalizedRole;
};

// Funcion 'validateCreateRole': valida precondiciones de entrada y lanza errores de contrato cuando corresponde.
const validateCreateRole = (role) => {
  if (role === undefined || role === null || role === "") return ROLES.ADMIN;
  return normalizeAndValidateRole(role);
};

// Funcion 'toStoredRole': mapea/convierte datos entre formatos internos y externos del sistema.
const toStoredRole = (role) => {
  const normalized = normalizeAndValidateRole(role);
  if (normalized === ROLES.SUPER_ADMIN) return STORED_ROLE_SUPER_ADMIN;
  return STORED_ROLE_ADMIN;
};

// Funcion 'normalizeStatus': normaliza valores de entrada para mantener consistencia de contrato.
const normalizeStatus = (status, isActive) => {
  if (isActive !== undefined && typeof isActive !== "boolean") {
    throw buildError(400, "VALIDATION_ERROR", "isActive debe ser boolean", {
      field: "isActive",
      value: isActive,
    });
  }

  if (typeof isActive === "boolean") {
    return isActive ? STATUS_ACTIVE : STATUS_INACTIVE;
  }
  if (status === undefined) return null;

  const value = String(status).trim().toLowerCase();
  if (value === "active" || value === "activo") return STATUS_ACTIVE;
  if (value === "inactive" || value === "inactivo") return STATUS_INACTIVE;

  throw buildError(400, "VALIDATION_ERROR", "status debe ser Activo o Inactivo", {
    field: "status",
    value: status,
  });
};

// Funcion 'validateName': valida precondiciones de entrada y lanza errores de contrato cuando corresponde.
const validateName = (name, fieldName = "name") => {
  const normalized = String(name || "").trim();
  if (normalized.length < MIN_NAME_LENGTH) {
    throw buildError(
      400,
      "VALIDATION_ERROR",
      `${fieldName} debe tener al menos ${MIN_NAME_LENGTH} caracteres`,
      { field: fieldName, minLength: MIN_NAME_LENGTH }
    );
  }
  return normalized;
};

// Funcion 'validateEmail': valida precondiciones de entrada y lanza errores de contrato cuando corresponde.
const validateEmail = (email) => {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    throw buildError(400, "VALIDATION_ERROR", "email es obligatorio", { field: "email" });
  }
  if (!EMAIL_REGEX.test(normalized)) {
    throw buildError(400, "VALIDATION_ERROR", "email tiene un formato invalido", {
      field: "email",
      value: email,
    });
  }
  return normalized;
};

// Funcion 'validatePassword': valida precondiciones de entrada y lanza errores de contrato cuando corresponde.
const validatePassword = (password) => {
  const normalized = String(password || "");
  if (!normalized) {
    throw buildError(400, "VALIDATION_ERROR", "password es obligatorio", {
      field: "password",
    });
  }
  if (normalized.length < MIN_PASSWORD_LENGTH) {
    throw buildError(
      400,
      "VALIDATION_ERROR",
      `password debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      { field: "password", minLength: MIN_PASSWORD_LENGTH }
    );
  }
  return normalized;
};

// Convierte documento de DB a shape de API sin datos sensibles.
// Funcion 'toSafeUser': mapea/convierte datos entre formatos internos y externos del sistema.
const toSafeUser = (doc) => {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    name: doc.userName || doc.companyName || "Admin",
    userName: doc.userName || "",
    companyName: doc.companyName || "",
    email: doc.email,
    role: normalizeRole(doc.role),
    roleLabel: doc.role || STORED_ROLE_ADMIN,
    status: doc.status || STATUS_ACTIVE,
    isActive: doc.status === STATUS_ACTIVE || doc.status === "Active" || doc.isActive === true,
    restorePassword: doc.restorePassword ?? 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

// Funcion 'list': lista registros de la entidad/modulo y prepara datos para respuesta.
const list = async () => {
  const docs = await Admin.find({}).select(SAFE_SELECT).sort({ createdAt: -1 });
  return docs.map(toSafeUser);
};

// Funcion 'getById': obtiene un registro por identificador y permite control de existencia/errores.
const getById = async (id) => {
  validateObjectId(id);
  const doc = await Admin.findById(id).select(SAFE_SELECT);
  return toSafeUser(doc);
};

// Funcion 'ensureEmailUnique': valida precondiciones de entrada y lanza errores de contrato cuando corresponde.
const ensureEmailUnique = async (email, currentUserId) => {
  const existing = await Admin.findOne({ email }).select("_id");
  if (!existing) return;
  if (currentUserId && existing._id.toString() === currentUserId.toString()) return;

  throw buildError(409, "CONFLICT", "email ya existe", {
    field: "email",
    value: email,
  });
};

// Funcion 'createOne': crea un registro nuevo aplicando reglas/validaciones del flujo.
const createOne = async (payload) => {
  const companyName = validateName(payload?.companyName || payload?.name, "companyName");
  const userName = validateName(payload?.userName || payload?.name, "userName");
  const email = validateEmail(payload?.email);
  const password = validatePassword(payload?.password);
  const createRole = validateCreateRole(payload?.role);
  const role = toStoredRole(createRole);
  const status = normalizeStatus(payload?.status, payload?.isActive) || STATUS_ACTIVE;

  await ensureEmailUnique(email);
  const passwordHash = await hashPassword(password);

  const created = await Admin.create({
    companyName: String(companyName).trim(),
    userName: String(userName).trim(),
    email,
    password: passwordHash,
    role,
    status,
    restorePassword:
      payload?.restorePassword === undefined ? 0 : Number(payload.restorePassword) || 0,
  });

  const safeCreated = await Admin.findById(created._id).select(SAFE_SELECT);
  return toSafeUser(safeCreated);
};

// Funcion 'updateById': actualiza un registro existente segun id y payload permitido.
const updateById = async (id, payload) => {
  validateObjectId(id);

  const body = payload || {};
  const keys = Object.keys(body);
  if (!keys.length) {
    throw buildError(400, "VALIDATION_ERROR", "payload vacio", {
      allowedFields: ALLOWED_PATCH_FIELDS,
    });
  }

  const blockedField = BLOCKED_PATCH_FIELDS.find((field) => Object.hasOwn(body, field));
  if (blockedField) {
    throw buildError(400, "VALIDATION_ERROR", `No se permite editar ${blockedField}`, {
      field: blockedField,
    });
  }

  const unknownFields = keys.filter((field) => !ALLOWED_PATCH_FIELDS.includes(field));
  if (unknownFields.length) {
    throw buildError(400, "VALIDATION_ERROR", "payload contiene campos no permitidos", {
      unknownFields,
      allowedFields: ALLOWED_PATCH_FIELDS,
    });
  }

  const admin = await Admin.findById(id);
  if (!admin) return null;

  if (Object.hasOwn(body, "email")) {
    const normalizedEmail = validateEmail(body.email);
    await ensureEmailUnique(normalizedEmail, admin._id);
    admin.email = normalizedEmail;
  }

  if (Object.hasOwn(body, "name") || Object.hasOwn(body, "userName")) {
    const source = Object.hasOwn(body, "name") ? "name" : "userName";
    const name = validateName(body[source], source);
    admin.userName = name;
    if (!admin.companyName) admin.companyName = name;
  }

  if (Object.hasOwn(body, "companyName")) {
    admin.companyName = validateName(body.companyName, "companyName");
  }

  if (Object.hasOwn(body, "role")) {
    admin.role = toStoredRole(body.role);
  }

  if (Object.hasOwn(body, "status") || Object.hasOwn(body, "isActive")) {
    admin.status = normalizeStatus(body.status, body.isActive);
  }

  if (Object.hasOwn(body, "password")) {
    const password = validatePassword(body.password);
    admin.password = await hashPassword(password);
  }

  const updated = await admin.save();
  const safeUpdated = await Admin.findById(updated._id).select(SAFE_SELECT);
  return toSafeUser(safeUpdated);
};

// Funcion 'deleteById': elimina registros (individual o masivo) segun reglas de negocio.
const deleteById = async (id) => {
  validateObjectId(id);
  const deleted = await Admin.findByIdAndDelete(id).select(SAFE_SELECT);
  return toSafeUser(deleted);
};

// Funcion 'bulkDeleteByIds': elimina varios registros por ids y devuelve resumen de resultados.
const bulkDeleteByIds = async (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw buildError(400, "VALIDATION_ERROR", "ids debe ser un arreglo no vacio", {
      field: "ids",
    });
  }

// Catalogo de valores permitidos o lista de referencia para validacion y control de flujo.
  const uniqueIds = [...new Set(ids.map((id) => String(id)))];
  const invalidIds = uniqueIds.filter((id) => !mongoose.Types.ObjectId.isValid(id));
  if (invalidIds.length > 0) {
    throw buildError(400, "VALIDATION_ERROR", "ids contiene ObjectId invalidos", {
      invalidIds,
    });
  }

  const docs = await Admin.find({ _id: { $in: uniqueIds } }).select("_id");
  const foundIds = docs.map((doc) => doc._id.toString());
  const foundSet = new Set(foundIds);
  const notFoundIds = uniqueIds.filter((id) => !foundSet.has(id));

  if (foundIds.length > 0) {
    await Admin.deleteMany({ _id: { $in: foundIds } });
  }

  return {
    requestedCount: uniqueIds.length,
    deletedCount: foundIds.length,
    deletedIds: foundIds,
    notFoundCount: notFoundIds.length,
    notFoundIds,
  };
};

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = {
  list,
  getById,
  createOne,
  updateById,
  deleteById,
  bulkDeleteByIds,
  validateObjectId,
  buildError,
};
