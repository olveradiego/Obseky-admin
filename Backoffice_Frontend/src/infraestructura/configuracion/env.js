/**
 * @filePurpose env.js
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
// El fallback ahora es string vacio para usar URLs relativas por defecto
const FALLBACK_API_BASE_URL = "";

/**
 * @function trimTrailingSlash
 * @description Ejecuta la logica asociada a 'trim trailing slash' y retorna su resultado.
 */
const trimTrailingSlash = (value) => String(value || "").trim().replace(/\/+$/, "");

// Validamos para permitir que la variable sea string vacío intencionalmente
const envApiBase = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = typeof envApiBase !== "undefined" 
  ? trimTrailingSlash(envApiBase) 
  : FALLBACK_API_BASE_URL;

