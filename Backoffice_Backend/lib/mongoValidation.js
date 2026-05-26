// Archivo: lib/mongoValidation.js
// Proposito: utilidades transversales reutilizables (errores, authz, validaciones, respuestas).

const mongoose = require("mongoose");
const { validationError } = require("./errorCatalog");

// Funcion 'ensureValidObjectId': valida precondiciones de entrada y lanza errores de contrato cuando corresponde.
const ensureValidObjectId = (id, field = "id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw validationError(`${field} debe ser un ObjectId valido`, { field, value: id });
  }
};

// Funcion 'ensureBulkIds': valida precondiciones de entrada y lanza errores de contrato cuando corresponde.
const ensureBulkIds = (ids) => {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw validationError("ids debe ser un arreglo no vacio", { field: "ids" });
  }

// Catalogo de valores permitidos o lista de referencia para validacion y control de flujo.
  const uniqueIds = [...new Set(ids.map((id) => String(id)))];
  const invalidIds = uniqueIds.filter((id) => !mongoose.Types.ObjectId.isValid(id));
  if (invalidIds.length > 0) {
    throw validationError("ids contiene ObjectId invalidos", { invalidIds });
  }

  return uniqueIds;
};

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = {
  ensureValidObjectId,
  ensureBulkIds,
};


