/**
 * @filePurpose loginAndLoadProfile.js
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
import { mapApiError } from "../errores/mapApiError";

/**
 * @function loginAndLoadProfile
 * @description Ejecuta la logica asociada a 'login and load profile' y retorna su resultado.
 */
export const loginAndLoadProfile = async ({ authRepository, credentials }) => {
  try {
    const loginResult = await authRepository.login(credentials);
    if (!loginResult.ok) {
      const apiError = loginResult.error || mapApiError({ fallbackMessage: "No se pudo iniciar sesion." });
      return {
        ok: false,
        error: apiError.message,
        errorMeta: apiError,
      };
    }

    const token = loginResult.data.token;
    const profileResult = await authRepository.getProfile(token);
    if (!profileResult.ok) {
      const apiError = profileResult.error || mapApiError({ fallbackMessage: "No se pudo cargar perfil." });
      return {
        ok: false,
        error: apiError.message,
        errorMeta: apiError,
      };
    }

    return {
      ok: true,
      token,
      profile: profileResult.data,
    };
  } catch (error) {
    const apiError = mapApiError({
      error,
      fallbackMessage: "Error de red o backend no disponible.",
    });
    return {
      ok: false,
      error: apiError.message,
      errorMeta: apiError,
    };
  }
};

