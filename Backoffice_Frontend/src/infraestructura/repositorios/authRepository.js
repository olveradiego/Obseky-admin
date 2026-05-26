/**
 * @filePurpose authRepository.js
 * @description Repositorio de autenticacion para login y perfil.
 */
import { createHttpClient } from "../http/httpClient";
import { ENDPOINTS } from "../http/endpoints";

/**
 * @function createAuthRepository
 * @description Crea un repositorio de autenticacion con operaciones de login y perfil.
 */
export const createAuthRepository = (apiBase) => {
  const httpClient = createHttpClient(apiBase);

  /**
   * @function login
   * @description Envia credenciales y recibe token + datos de sesion.
   */
  const login = async (credentials) =>
    httpClient.request({
      path: ENDPOINTS.auth.login,
      method: "POST",
      body: credentials,
      fallbackMessage: "No se pudo iniciar sesion.",
    });

  /**
   * @function getProfile
   * @description Obtiene el perfil autenticado usando el token JWT.
   */
  const getProfile = async (token) =>
    httpClient.request({
      path: ENDPOINTS.auth.me,
      method: "GET",
      token,
      fallbackMessage: "No se pudo cargar el perfil.",
    });

  return {
    login,
    getProfile,
  };
};
