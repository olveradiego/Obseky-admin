/**
 * @filePurpose errorParser.js
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
/**
 * @function isNonEmptyString
 * @description Ejecuta la logica asociada a 'is non empty string' y retorna su resultado.
 */
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

const STATUS_CODE_MAP = {
  400: "VALIDATION_ERROR",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  500: "INTERNAL_ERROR",
};

/**
 * @function firstArrayMessage
 * @description Ejecuta la logica asociada a 'first array message' y retorna su resultado.
 */
const firstArrayMessage = (value) => {
  if (!Array.isArray(value)) return "";
  for (const item of value) {
    if (isNonEmptyString(item?.message)) return item.message.trim();
  }
  return "";
};

export const parseBackendError = ({
  status = 0,
  data,
  fallbackMessage = "La operacion no se pudo completar.",
}) => {
  const backendError = data?.backendError && typeof data.backendError === "object" ? data.backendError : null;

  const code =
    (isNonEmptyString(backendError?.code) && backendError.code.trim()) ||
    (isNonEmptyString(data?.code) && data.code.trim()) ||
    STATUS_CODE_MAP[status] ||
    "";

  const message =
    (isNonEmptyString(backendError?.message) && backendError.message.trim()) ||
    (isNonEmptyString(data?.message) && data.message.trim()) ||
    (isNonEmptyString(data?.error) && data.error.trim()) ||
    firstArrayMessage(data?.errors) ||
    fallbackMessage;

  return {
    status,
    code,
    message,
    details: backendError?.details ?? data?.details ?? null,
  };
};

export const parseTransportError = ({
  error,
  fallbackMessage = "Error de red o backend no disponible.",
}) => {
  if (!error) {
    return {
      status: 0,
      code: "NETWORK_ERROR",
      message: fallbackMessage,
      details: null,
    };
  }

  if (error.name === "AbortError") {
    return {
      status: 0,
      code: "REQUEST_TIMEOUT",
      message: "La solicitud excedio el tiempo de espera.",
      details: null,
    };
  }

  if (error.name === "SyntaxError") {
    return {
      status: 0,
      code: "PAYLOAD_INVALID",
      message: fallbackMessage,
      details: null,
    };
  }

  return {
    status: 0,
    code: "NETWORK_ERROR",
    message: fallbackMessage,
    details: null,
  };
};

