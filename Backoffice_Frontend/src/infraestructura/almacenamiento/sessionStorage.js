/**
 * @filePurpose sessionStorage.js
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
const STORAGE_KEY = "loginadmin.session.v1";

/**
 * @function loadSession
 * @description Ejecuta la logica asociada a 'load session' y retorna su resultado.
 */
export const loadSession = () => {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return null;
    const parsed = JSON.parse(rawValue);
    if (typeof parsed !== "object" || parsed === null) return null;
    return {
      apiBase: parsed.apiBase || "",
      token: parsed.token || "",
    };
  } catch {
    return null;
  }
};

/**
 * @function saveSession
 * @description Ejecuta la logica asociada a 'save session' y retorna su resultado.
 */
export const saveSession = ({ apiBase, token }) => {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      apiBase: apiBase || "",
      token: token || "",
    })
  );
};

/**
 * @function clearSession
 * @description Ejecuta la logica asociada a 'clear session' y retorna su resultado.
 */
export const clearSession = () => {
  window.localStorage.removeItem(STORAGE_KEY);
};
