// Archivo: services/finalCustomerService.js
// Proposito: capa de servicio con reglas de negocio, validaciones y acceso a datos.

const FinalCustomer = require("@/models/FinalCustomer");
const { ensureValidObjectId, ensureBulkIds } = require("@/lib/mongoValidation");
const { validationError } = require("@/lib/errorCatalog");

// Funcion 'assertObjectPayload': valida precondiciones de entrada y lanza errores de contrato cuando corresponde.
const assertObjectPayload = (payload, mode) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw validationError("payload invalido", { mode });
  }
  if (mode === "update" && Object.keys(payload).length === 0) {
    throw validationError("payload vacio", { mode });
  }
};

// Funcion 'list': lista registros de la entidad/modulo y prepara datos para respuesta.
const list = async () => FinalCustomer.find({}).sort({ createdAt: -1 });

// Funcion 'getById': obtiene un registro por identificador y permite control de existencia/errores.
const getById = async (id) => {
  ensureValidObjectId(id);
  return FinalCustomer.findById(id);
};

// Funcion 'createOne': crea un registro nuevo aplicando reglas/validaciones del flujo.
const createOne = async (payload) => {
  assertObjectPayload(payload, "create");
  return FinalCustomer.create(payload);
};

// Funcion 'updateById': actualiza un registro existente segun id y payload permitido.
const updateById = async (id, payload) => {
  ensureValidObjectId(id);
  assertObjectPayload(payload, "update");
  return FinalCustomer.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
};

// Funcion 'deleteById': elimina registros (individual o masivo) segun reglas de negocio.
const deleteById = async (id) => {
  ensureValidObjectId(id);
  return FinalCustomer.findByIdAndDelete(id);
};

// Funcion 'bulkDeleteByIds': elimina varios registros por ids y devuelve resumen de resultados.
const bulkDeleteByIds = async (ids) => {
  const uniqueIds = ensureBulkIds(ids);
  const foundDocs = await FinalCustomer.find({ _id: { $in: uniqueIds } }).select("_id");
  const foundIds = foundDocs.map((doc) => String(doc._id));
  const foundSet = new Set(foundIds);
  const notFoundIds = uniqueIds.filter((id) => !foundSet.has(id));

  if (foundIds.length > 0) {
    await FinalCustomer.deleteMany({ _id: { $in: foundIds } });
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
};
