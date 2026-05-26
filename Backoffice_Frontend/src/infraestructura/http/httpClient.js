/**
 * @filePurpose httpClient.js
 * @description Cliente HTTP compartido con timeout/retry y parseo estandarizado.
 */
import { parseBackendError, parseTransportError } from "./errorParser";

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_RETRIES = 0;

/**
 * @function trimTrailingSlash
 * @description Ejecuta la logica asociada a 'trim trailing slash' y retorna su resultado.
 */
const trimTrailingSlash = (value) => String(value || "").trim().replace(/\/+$/, "");

/**
 * @function safeJson
 * @description Ejecuta la logica asociada a 'safe json' y retorna su resultado.
 */
export const safeJson = async (response) => {
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
};

/**
 * @function executeRequest
 * @description Ejecuta la logica asociada a 'execute request' y retorna su resultado.
 */
const executeRequest = async ({ apiBase, path, method, token, body, timeoutMs }) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const controller = new AbortController();
  /**
   * @function timeoutId
   * @description Ejecuta la logica asociada a 'timeout id' y retorna su resultado.
   */
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${apiBase}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await safeJson(response);
    return { response, data };
  } finally {
    clearTimeout(timeoutId);
  }
};

const executeBinaryRequest = async ({ apiBase, path, method, token, timeoutMs }) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${apiBase}${path}`, {
      method,
      headers,
      signal: controller.signal,
    });

    if (response.ok) {
      const blob = await response.blob();
      return { response, blob, errorData: null };
    }

    const errorData = await safeJson(response);
    return { response, blob: null, errorData };
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * @function createHttpClient
 * @description Ejecuta la logica asociada a 'create http client' y retorna su resultado.
 */
export const createHttpClient = (apiBase, options = {}) => {
  const base = trimTrailingSlash(apiBase);
  const defaultTimeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const defaultRetries = options.retry ?? DEFAULT_RETRIES;

  const request = async ({
    path,
    method = "GET",
    token = "",
    body,
    timeoutMs = defaultTimeoutMs,
    retry = defaultRetries,
    fallbackMessage = "La operacion no se pudo completar.",
  }) => {
    let lastError = null;
    const attempts = Math.max(0, Number(retry) || 0) + 1;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const { response, data } = await executeRequest({
          apiBase: base,
          path,
          method,
          token,
          body,
          timeoutMs,
        });

        if (response.ok) {
          return {
            ok: true,
            status: response.status,
            data,
            error: null,
            response,
          };
        }

        return {
          ok: false,
          status: response.status,
          data,
          error: parseBackendError({
            status: response.status,
            data,
            fallbackMessage,
          }),
          response,
        };
      } catch (error) {
        lastError = error;
        if (attempt < attempts) continue;
      }
    }

    return {
      ok: false,
      status: 0,
      data: null,
      error: parseTransportError({ error: lastError, fallbackMessage }),
      response: null,
    };
  };

  const requestBinary = async ({
    path,
    method = "GET",
    token = "",
    timeoutMs = defaultTimeoutMs,
    retry = defaultRetries,
    fallbackMessage = "La operacion no se pudo completar.",
  }) => {
    let lastError = null;
    const attempts = Math.max(0, Number(retry) || 0) + 1;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const { response, blob, errorData } = await executeBinaryRequest({
          apiBase: base,
          path,
          method,
          token,
          timeoutMs,
        });

        if (response.ok) {
          return {
            ok: true,
            status: response.status,
            data: {
              blob,
              headers: response.headers,
            },
            error: null,
            response,
          };
        }

        return {
          ok: false,
          status: response.status,
          data: errorData,
          error: parseBackendError({
            status: response.status,
            data: errorData,
            fallbackMessage,
          }),
          response,
        };
      } catch (error) {
        lastError = error;
        if (attempt < attempts) continue;
      }
    }

    return {
      ok: false,
      status: 0,
      data: null,
      error: parseTransportError({ error: lastError, fallbackMessage }),
      response: null,
    };
  };

  return { request, requestBinary };
};


