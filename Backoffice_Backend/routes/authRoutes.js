// Archivo: routes/authRoutes.js
// Proposito: definicion de endpoints y mapeo hacia controladores.

// Router de Express para endpoints de autenticación/autorización.
const express = require("express");
// Handlers del módulo auth/admin.
const {
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
} = require("../controllers/authController");

// Instancia de router para agrupar endpoints de auth.
const router = express.Router();

// Semilla de admins de prueba (manual).
router.post("/seed", handleSeedAdmins);
// Login por email/password -> genera JWT.
router.post("/login", handleLoginAdmin);
// Crea un admin (solo SUPER_ADMIN).
router.post("/admins", handleCreateAdmin);
// Activa/desactiva un admin por id.
router.patch("/admins/:adminId/status", handleSetAdminStatus);
// Cambia password de un admin por id.
router.patch("/admins/:adminId/password", handleChangePassword);
// Devuelve permisos de un rol.
router.get("/roles/:role/permissions", handleRolePermissions);
// Verifica permiso puntual módulo/acción según token.
router.get("/permissions/check", handlePermissionCheck);
// Verifica conexión a base de datos.
router.get("/db-check", handleDbCheck);
// Perfil del usuario autenticado.
router.get("/me", handleMe);
// Ruta protegida para ADMIN y SUPER_ADMIN.
router.get("/admin-area", handleAdminOnly);
// Ruta protegida exclusiva SUPER_ADMIN.
router.get("/superadmin-area", handleSuperAdminOnly);

// Exporta router para montarlo en app.js.
module.exports = router;


