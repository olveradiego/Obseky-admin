/**
 * @filePurpose executeCrudOperation.js
 * @description Motor compartido de validacion/ejecucion CRUD reutilizable por entidad.
 */
import { normalizeCrudResponse } from "@/aplicacion/adaptadores/crudResponseAdapter";
import { mapApiError } from "@/aplicacion/errores/mapApiError";

/**
 * @function isObject
 * @description Verifica si un valor es un objeto plano util para payloads.
 */
const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * @function buildFailure
 * @description Construye una respuesta de error homogenea para la capa de aplicacion.
 */
const buildFailure = (fallbackMessage, extras = {}) => ({
  status: 0,
  ok: false,
  data: null,
  error: mapApiError({ fallbackMessage }),
  ...extras,
});

/**
 * @function sanitizePayloadByFields
 * @description Filtra el payload dejando solo claves mutables declaradas por metadata.
 */
const sanitizePayloadByFields = ({ payload, fields = [] }) => {
  if (!Array.isArray(fields) || fields.length === 0) {
    return { sanitized: payload, unknownKeys: [] };
  }

  const mutableFields = new Set(fields.filter((field) => field?.mutable).map((field) => field.key));
  const sanitized = {};
  const unknownKeys = [];

  for (const [key, value] of Object.entries(payload || {})) {
    if (!mutableFields.has(key)) {
      unknownKeys.push(key);
      continue;
    }
    sanitized[key] = value;
  }

  return { sanitized, unknownKeys };
};

/**
 * @function validatePayloadByFields
 * @description Aplica validaciones de negocio basadas en metadata (ID, campos y enums).
 */
const validatePayloadByFields = ({ payload, method, id, fields = [], unknownKeys = [] }) => {
  if (method === "PATCH" && !String(id || "").trim()) return "El campo ID es obligatorio para PATCH.";
  if (unknownKeys.length > 0) return `Campos no permitidos en payload: ${unknownKeys.join(", ")}.`;

  if (method === "PATCH" && (!isObject(payload) || Object.keys(payload).length === 0)) {
    return "El payload para PATCH debe incluir al menos un campo a actualizar.";
  }

  const fieldByKey = Object.fromEntries((fields || []).map((field) => [field.key, field]));
  for (const [key, value] of Object.entries(payload || {})) {
    const field = fieldByKey[key];
    if (!field) continue;
    if (field.type === "enum" && Array.isArray(field.values) && field.values.length > 0) {
      if (!field.values.includes(String(value))) {
        return `El campo '${key}' debe ser uno de: ${field.values.join(", ")}.`;
      }
    }
  }

  return "";
};

/**
 * @function normalizeSuccessResult
 * @description Normaliza respuestas exitosas del repositorio al contrato CRUD de frontend.
 */
const normalizeSuccessResult = ({ repositoryResult, method, moduleName, hasId, id, selectedIds }) => {
  if (!repositoryResult.ok) {
    return {
      status: repositoryResult.status,
      ok: false,
      data: repositoryResult.data,
      error: repositoryResult.error,
    };
  }

  const normalized = normalizeCrudResponse({
    method,
    moduleName,
    hasId,
    data: repositoryResult.data,
    id,
    selectedIds,
  });

  if (!normalized.ok) return buildFailure(normalized.message, { data: repositoryResult.data });

  return {
    status: repositoryResult.status,
    ok: true,
    data: normalized.data,
    error: null,
  };
};

export const executeCrudOperation = async ({
  moduleRepository,
  method,
  moduleName,
  id = "",
  selectedIds = [],
  payloadText = "{}",
  token,
  moduleFields = [],
  filters = {},
}) => {
  try {
    const trimmedId = String(id || "").trim();
    const hasId = trimmedId.length > 0;

    if (method === "GET") {
      const repositoryResult =
        hasId && typeof moduleRepository.getById === "function"
          ? await moduleRepository.getById({ moduleName, id: trimmedId, token })
          : await moduleRepository.list({ moduleName, token, queryParams: filters });

      return normalizeSuccessResult({
        repositoryResult,
        method,
        moduleName,
        hasId,
        id: trimmedId,
      });
    }

    if (method === "DELETE") {
      if (!hasId) return buildFailure("El campo ID es obligatorio para DELETE.");

      const repositoryResult = await moduleRepository.remove({ moduleName, id: trimmedId, token });
      return normalizeSuccessResult({
        repositoryResult,
        method,
        moduleName,
        hasId: true,
        id: trimmedId,
      });
    }

    if (method === "BULK_DELETE") {
      if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
        return buildFailure("Debes seleccionar al menos un registro para eliminar.");
      }

      const cleanedIds = Array.from(
        new Set(
          selectedIds
            .map((candidate) => String(candidate || "").trim())
            .filter((candidate) => candidate.length > 0)
        )
      );

      if (cleanedIds.length === 0) return buildFailure("La seleccion no contiene IDs validos.");

      const repositoryResult = await moduleRepository.bulkDelete({
        moduleName,
        ids: cleanedIds,
        token,
      });

      return normalizeSuccessResult({
        repositoryResult,
        method,
        moduleName,
        hasId: false,
        selectedIds: cleanedIds,
      });
    }

    let payload = JSON.parse(payloadText);
    if (!isObject(payload)) return buildFailure("El payload JSON debe ser un objeto.");

    const sanitized = sanitizePayloadByFields({ payload, fields: moduleFields });
    payload = sanitized.sanitized;

    const validationError = validatePayloadByFields({
      payload,
      method,
      id: trimmedId,
      fields: moduleFields,
      unknownKeys: sanitized.unknownKeys,
    });
    if (validationError) return buildFailure(validationError);

    if (method === "POST") {
      const repositoryResult = await moduleRepository.create({ moduleName, token, payload });
      return normalizeSuccessResult({
        repositoryResult,
        method,
        moduleName,
        hasId: false,
      });
    }

    if (method === "PATCH") {
      const repositoryResult = await moduleRepository.update({
        moduleName,
        id: trimmedId,
        token,
        payload,
      });
      return normalizeSuccessResult({
        repositoryResult,
        method,
        moduleName,
        hasId: true,
        id: trimmedId,
      });
    }

    return buildFailure("Metodo no soportado.");
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        status: 0,
        ok: false,
        data: null,
        error: mapApiError({
          error,
          fallbackMessage: "El payload JSON tiene formato invalido.",
        }),
      };
    }

    return {
      status: 0,
      ok: false,
      data: null,
      error: mapApiError({
        error,
        fallbackMessage: "Error de red o backend no disponible.",
      }),
    };
  }
};

