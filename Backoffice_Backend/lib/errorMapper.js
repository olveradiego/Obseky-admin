// Archivo: lib/errorMapper.js
// Proposito: utilidades transversales reutilizables (errores, authz, validaciones, respuestas).

const { AppError } = require("./appError");
const { validationError, conflictError, internalError } = require("./errorCatalog");

// Funcion 'toAppError': mapea/convierte datos entre formatos internos y externos del sistema.
const toAppError = (error) => {
  if (!error) return internalError();
  if (error instanceof AppError) return error;

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    return {
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "Token invalido",
    };
  }

  if (error.code === 11000) {
    return conflictError("Conflicto de unicidad", { keyValue: error.keyValue });
  }

  if (typeof error.message === "string") {
    const m = error.message.toLowerCase();

    if (m.includes("ya existe")) {
      return conflictError(error.message);
    }
    if (
      m.includes("obligatorio") ||
      m.includes("invalido") ||
      m.includes("inválido") ||
      m.includes("payload")
    ) {
      return validationError(error.message);
    }
    if (m.includes("no encontrado")) {
      return {
        statusCode: 404,
        code: "NOT_FOUND",
        message: error.message,
      };
    }
    if (m.includes("no autorizado") || m.includes("solo super_admin")) {
      return {
        statusCode: 403,
        code: "FORBIDDEN",
        message: error.message,
      };
    }
    if (m.includes("credenciales") || m.includes("token")) {
      return {
        statusCode: 401,
        code: "UNAUTHORIZED",
        message: error.message,
      };
    }
  }

  if (error.name === "ValidationError") {
    return validationError("Error de validacion", {
      errors: Object.keys(error.errors || {}),
    });
  }

  if (error.statusCode && error.code) {
    return error;
  }

  return internalError("Error interno");
};

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = {
  toAppError,
};


