// Archivo: services/authService.js
// Proposito: capa de servicio con reglas de negocio, validaciones y acceso a datos.

// Firma y validación de JWT.
const jwt = require("jsonwebtoken");
// Comparación de passwords con bcrypt.
const bcrypt = require("bcryptjs");
// Modelo de administradores en colección users.
const Admin = require("@/models/Admin");
// Helpers de roles/permisos.
const {
  ROLES,
  isValidRole,
  normalizeRole,
} = require("@/services/rolePermissionService");
// Operaciones de usuarios admins.
const {
  createAdmin,
  findAdminByEmail,
} = require("@/services/userAdminService");

// Usuarios semilla para entorno de pruebas.
const DEFAULT_ADMINS = [
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
];

const getJwtSecret = () => process.env.JWT_SECRET || "dev_secret";

const extractBearerToken = (authorizationHeader) => {
  const header = String(authorizationHeader || "").trim();
  if (!header) {
    throw new Error("Token no proporcionado");
  }

  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1]) {
    throw new Error("Token no proporcionado");
  }

  return match[1].trim();
};

// Crea admins por defecto si no existen y corrige rol si está desalineado.
// Funcion 'seedDefaultAdmins': inicializa datos base requeridos para operar el sistema.
const seedDefaultAdmins = async () => {
  for (const entry of DEFAULT_ADMINS) {
    const exists = await Admin.findOne({ email: entry.email.toLowerCase() });
    if (!exists) {
      await createAdmin(entry);
      continue;
    }

    const normalizedStoredRole = normalizeRole(exists.role);
    if (!normalizedStoredRole || normalizedStoredRole !== entry.role) {
      exists.role = entry.role === ROLES.SUPER_ADMIN ? "SuperAdmin" : "Admin";
      await exists.save();
    }
  }
};

// Autentica admin por email/password.
// Recibe credenciales y devuelve token + datos del admin.
// Funcion 'loginAdmin': autentica credenciales y construye sesion/token de acceso.
const loginAdmin = async (email, password) => {
  const admin = await findAdminByEmail(email);
  if (!admin) {
    throw new Error("Credenciales invalidas");
  }

  const isActive =
    admin.status === "Active" ||
    admin.status === "Activo" ||
    admin.isActive === true;
  if (!isActive) {
    throw new Error("Admin inactivo");
  }

  const storedPassword = admin.password || "";
  let validPassword = false;
  // Si la contraseña está hasheada (bcrypt), compara con compare.
  // Si es legacy plano, compara en texto para mantener compatibilidad.
  if (storedPassword.startsWith("$2")) {
    validPassword = await bcrypt.compare(password, storedPassword);
  } else {
    validPassword = storedPassword === password;
  }
  if (!validPassword) {
    throw new Error("Credenciales invalidas");
  }

  const normalizedRole = normalizeRole(admin.role);
  if (!normalizedRole || !isValidRole(normalizedRole)) {
    throw new Error("Rol invalido");
  }

  const displayName = admin.userName || admin.name || admin.companyName || "Admin";

  // Construye y firma JWT con datos mínimos de identidad y rol.
  const token = jwt.sign(
    {
      adminId: admin._id.toString(),
      source: "users",
      name: displayName,
      email: admin.email,
      role: normalizedRole,
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );

  return {
    token,
    admin: {
      id: admin._id,
      name: displayName,
      email: admin.email,
      role: normalizedRole,
      isActive,
      source: "users",
    },
  };
};

// Valida encabezado Authorization y decodifica el JWT.
// Funcion 'decodeToken': decodifica informacion de autenticacion/token para identificar al actor.
const decodeToken = (authorizationHeader) => {
  const token = extractBearerToken(authorizationHeader);
  const decoded = jwt.verify(token, getJwtSecret());
  return decoded;
};

// Exporta funciones principales de autenticación/autorización.
module.exports = {
  seedDefaultAdmins,
  loginAdmin,
  decodeToken,
  extractBearerToken,
  getJwtSecret,
  ROLES,
};
