// Archivo: services/customerService.js
// Proposito: capa de servicio con reglas de negocio, validaciones y acceso a datos.

const Customer = require("@/models/Customer");
const { ensureValidObjectId, ensureBulkIds } = require("@/lib/mongoValidation");
const { validationError } = require("@/lib/errorCatalog");

// Catalogo de valores permitidos o lista de referencia para validacion y control de flujo.
const CUSTOMER_FIELDS = [
  "businessName",
  "customerName",
  "order",
  "cardId",
  "message",
  "images",
  "video",
  "secretCode",
  "orderStatus",
  "status",
];
// Catalogo de valores permitidos o lista de referencia para validacion y control de flujo.
const CUSTOMER_STATUS = ["Active", "Inactive"];
// Catalogo de valores permitidos o lista de referencia para validacion y control de flujo.
const CUSTOMER_ORDER_STATUS = ["OK"];

// Funcion 'normalizeString': normaliza valores de entrada para mantener consistencia de contrato.
const normalizeString = (value) => String(value ?? "").trim();

// Funcion 'normalizeCustomerPayload': normaliza valores de entrada para mantener consistencia de contrato.
const normalizeCustomerPayload = (payload, mode) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw validationError("payload invalido", { mode });
  }

  const keys = Object.keys(payload);
  if (mode === "update" && keys.length === 0) {
    throw validationError("payload vacio", { mode, allowedFields: CUSTOMER_FIELDS });
  }

  const unknownFields = keys.filter((key) => !CUSTOMER_FIELDS.includes(key));
  if (unknownFields.length > 0) {
    throw validationError("payload contiene campos no permitidos", {
      unknownFields,
      allowedFields: CUSTOMER_FIELDS,
    });
  }

  const normalized = {};
  for (const key of keys) {
    normalized[key] = normalizeString(payload[key]);
  }

  if (Object.hasOwn(normalized, "status")) {
    if (!CUSTOMER_STATUS.includes(normalized.status)) {
      throw validationError("status invalido", {
        field: "status",
        accepted: CUSTOMER_STATUS,
        value: payload.status,
      });
    }
  }

  if (Object.hasOwn(normalized, "orderStatus")) {
    if (!CUSTOMER_ORDER_STATUS.includes(normalized.orderStatus)) {
      throw validationError("orderStatus invalido", {
        field: "orderStatus",
        accepted: CUSTOMER_ORDER_STATUS,
        value: payload.orderStatus,
      });
    }
  }

  return normalized;
};

// Funcion 'list': lista registros de la entidad/modulo y prepara datos para respuesta.
const list = async () => Customer.find({}).sort({ createdAt: -1 });

// Funcion 'getById': obtiene un registro por identificador y permite control de existencia/errores.
const getById = async (id) => {
  ensureValidObjectId(id);
  return Customer.findById(id);
};

// Funcion 'createOne': crea un registro nuevo aplicando reglas/validaciones del flujo.
const createOne = async (payload) => {
  const normalized = normalizeCustomerPayload(payload, "create");
  return Customer.create(normalized);
};

// Funcion 'updateById': actualiza un registro existente segun id y payload permitido.
const updateById = async (id, payload) => {
  ensureValidObjectId(id);
  const normalized = normalizeCustomerPayload(payload, "update");
  return Customer.findByIdAndUpdate(id, normalized, { new: true, runValidators: true });
};

// Funcion 'deleteById': elimina registros (individual o masivo) segun reglas de negocio.
const deleteById = async (id) => {
  ensureValidObjectId(id);
  return Customer.findByIdAndDelete(id);
};

// Funcion 'bulkDeleteByIds': elimina varios registros por ids y devuelve resumen de resultados.
const bulkDeleteByIds = async (ids) => {
  const uniqueIds = ensureBulkIds(ids);
  const foundDocs = await Customer.find({ _id: { $in: uniqueIds } }).select("_id");
  const foundIds = foundDocs.map((doc) => String(doc._id));
  const foundSet = new Set(foundIds);
  const notFoundIds = uniqueIds.filter((id) => !foundSet.has(id));

  if (foundIds.length > 0) {
    await Customer.deleteMany({ _id: { $in: foundIds } });
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
  CUSTOMER_FIELDS,
  CUSTOMER_STATUS,
  CUSTOMER_ORDER_STATUS,
  list,
  getById,
  createOne,
  updateById,
  deleteById,
  bulkDeleteByIds,
};
