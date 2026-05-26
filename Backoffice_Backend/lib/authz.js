// Archivo: lib/authz.js
// Proposito: utilidades transversales reutilizables (errores, authz, validaciones, respuestas).

const { decodeToken } = require("../services/authService");
const { hasModulePermission } = require("../services/rolePermissionService");
const { unauthorizedError, forbiddenError } = require("./errorCatalog");

// Funcion 'decodeAuthorization': decodifica informacion de autenticacion/token para identificar al actor.
const decodeAuthorization = (authorizationHeader) => {
  try {
    return decodeToken(authorizationHeader);
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      throw unauthorizedError("Token invalido");
    }
    throw unauthorizedError("Token ausente o invalido");
  }
};

// Funcion 'authorizeModuleAction': verifica permisos/autorizacion antes de ejecutar la accion solicitada.
const authorizeModuleAction = (authorizationHeader, moduleName, action) => {
  const actor = decodeAuthorization(authorizationHeader);
  const allowed = hasModulePermission(actor.role, moduleName, action);
  if (!allowed) {
    throw forbiddenError(`Rol sin permiso para modulo ${moduleName}`);
  }
  return actor;
};

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = {
  decodeAuthorization,
  authorizeModuleAction,
};


