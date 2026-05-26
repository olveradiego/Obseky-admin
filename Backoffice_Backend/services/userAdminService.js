// Archivo: services/userAdminService.js
// Proposito: capa de servicio con reglas de negocio, validaciones y acceso a datos.

// Librería para hash y comparación segura de passwords.
const bcrypt = require("bcryptjs");
// Modelo de usuarios administradores (colección users).
const Admin = require("@/models/Admin");
// Utilidades de roles para validación y normalización.
const { ROLES, isValidRole, normalizeRole } = require("@/services/rolePermissionService");

// Cost factor de bcrypt (balance entre seguridad y rendimiento).
const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;

// Estandariza el email para búsquedas y unicidad consistentes.
// Funcion 'normalizeEmail': normaliza valores de entrada para mantener consistencia de contrato.
const normalizeEmail = (email) => email.trim().toLowerCase();
// Convierte rol oficial a formato almacenado en colección legacy.
// Funcion 'toStoredRole': mapea/convierte datos entre formatos internos y externos del sistema.
const toStoredRole = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === ROLES.SUPER_ADMIN) return "SuperAdmin";
  if (normalized === ROLES.ADMIN) return "Admin";
  return null;
};

// Funcion 'toStoredStatus': mapea/convierte datos entre formatos internos y externos del sistema.
const toStoredStatus = (isActive) => (isActive ? "Activo" : "Inactivo");

// Genera hash bcrypt de password en texto plano.
// Funcion 'hashPassword': aplica hashing seguro para proteger datos sensibles.
const hashPassword = async (plainPassword) => bcrypt.hash(plainPassword, SALT_ROUNDS);

// Crea un nuevo administrador.
// Recibe: name, email, password, role.
// Devuelve: documento creado en MongoDB.
// Funcion 'createAdmin': crea un registro nuevo aplicando reglas/validaciones del flujo.
const createAdmin = async ({ name, email, password, role = ROLES.ADMIN }) => {
  if (!name || !email || !password) {
    throw new Error("name, email y password son obligatorios");
  }
  if (String(password).length < MIN_PASSWORD_LENGTH) {
    throw new Error(`password debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
  }

  const normalizedRole = normalizeRole(role);
  if (!normalizedRole || !isValidRole(normalizedRole)) {
    throw new Error("Rol invalido");
  }

  const normalizedEmail = normalizeEmail(email);
  const exists = await Admin.findOne({ email: normalizedEmail });
  if (exists) {
    throw new Error("Ya existe un admin con ese email");
  }

  const passwordHash = await hashPassword(password);
  const userName = name.trim();
  const storedRole = toStoredRole(normalizedRole);
  const companyName = userName;

  // Inserta un usuario admin en la colección users.
  const created = await Admin.create({
    companyName,
    userName,
    email: normalizedEmail,
    password: passwordHash,
    role: storedRole,
    status: toStoredStatus(true),
    restorePassword: 0,
  });

  return created;
};

// Busca administrador por email normalizado.
// Funcion 'findAdminByEmail': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const findAdminByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  return Admin.findOne({ email: normalizedEmail });
};

// Activa o desactiva un admin cambiando el campo status.
// Recibe adminId e isActive (boolean).
// Funcion 'setAdminStatus': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const setAdminStatus = async ({ adminId, isActive }) => {
  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw new Error("Admin no encontrado");
  }

  admin.status = toStoredStatus(isActive);
  await admin.save();
  return admin;
};

// Cambia password de un admin y la guarda hasheada.
// Recibe adminId y newPassword.
// Funcion 'changeAdminPassword': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const changeAdminPassword = async ({ adminId, newPassword }) => {
  if (!newPassword) {
    throw new Error("newPassword es obligatorio");
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw new Error("Admin no encontrado");
  }

  admin.password = await hashPassword(newPassword);
  await admin.save();
  return admin;
};

// Exporta operaciones del servicio de administración de usuarios.
module.exports = {
  hashPassword,
  createAdmin,
  findAdminByEmail,
  setAdminStatus,
  changeAdminPassword,
};
