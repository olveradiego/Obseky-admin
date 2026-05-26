// Archivo: middleware/authMiddleware.js
// Proposito: Contiene middlewares para proteger rutas y autorizar accesos basados en roles.

const jwt = require('jsonwebtoken');
const Admin = require('@/models/Admin'); // Asumiendo que el modelo Admin existe para los usuarios del backoffice
const asyncHandler = require('@/middleware/asyncHandler'); // Reutilizando el asyncHandler existente
const { unauthorizedError, forbiddenError } = require('@/lib/errorCatalog'); // Reutilizando el catálogo de errores
const { extractBearerToken, getJwtSecret } = require('@/services/authService');

/**
 * Middleware para proteger rutas.
 * Verifica la existencia y validez de un token JWT en el encabezado de autorización.
 * Si es válido, adjunta la información del administrador (sin la contraseña) a `req.user`.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Verifica si el token está presente en el encabezado de autorización
  if (req.headers.authorization) {
    try {
      // Extrae el token del encabezado
      token = extractBearerToken(req.headers.authorization);

      // Verifica el token
      const decoded = jwt.verify(token, getJwtSecret());

      // Busca al administrador en la base de datos usando el ID del token
      // y excluye la contraseña para seguridad
      req.user = await Admin.findById(decoded.adminId).select('-password');

      // Si no se encuentra el administrador, lanza un error
      if (!req.user) {
        throw unauthorizedError('Administrador no encontrado');
      }

      next(); // Continúa con la siguiente función middleware/ruta
    } catch (error) {
      // Si el token es inválido o hay otro error, lanza un error de no autorizado
      throw unauthorizedError('No autorizado, token fallido');
    }
  }

  // Si no hay token en el encabezado, lanza un error de no autorizado
  if (!token) {
    throw unauthorizedError('No autorizado, no hay token');
  }
});

/**
 * Middleware para autorizar roles.
 * Verifica si el rol del administrador autenticado (`req.user.role`) está incluido en la lista de roles permitidos.
 * @param {Array<string>} roles - Un array de roles permitidos (ej. ['SUPER_ADMIN', 'ADMIN']).
 */
const authorize = (roles = []) => {
  // Asegura que 'roles' sea un array
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // Si el administrador no está autenticado o su rol no está permitido, lanza un error de acceso denegado
    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      throw forbiddenError('Acceso denegado, el administrador no tiene los permisos necesarios');
    }
    next(); // Continúa con la siguiente función middleware/ruta
  };
};

module.exports = { protect, authorize };
