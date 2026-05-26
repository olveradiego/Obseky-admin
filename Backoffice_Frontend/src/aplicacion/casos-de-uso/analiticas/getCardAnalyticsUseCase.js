import { createModuleRepository } from "../../../infraestructura/repositorios/moduleRepository";
import { mapApiError } from "../../errores/mapApiError";

/**
 * @filePurpose getCardAnalyticsUseCase.js
 * @description Caso de uso para obtener estadÃ­sticas de tarjetas.
 */
export const getCardAnalyticsUseCase = async ({
  apiBase,
  token,
  companyName,
}) => {
  try {
    const moduleRepository = createModuleRepository(apiBase);
    const result = await moduleRepository.getCardStats({ token, companyName });

    if (!result.ok) {
      const apiError = result.error || mapApiError({ fallbackMessage: "No se pudieron cargar las estadÃ­sticas de tarjetas." });
      return {
        ok: false,
        error: apiError.message,
        errorMeta: apiError,
      };
    }

    return {
      ok: true,
      data: result.data,
    };
  } catch (error) {
    const apiError = mapApiError({ error, fallbackMessage: "Error de red o backend no disponible al obtener estadÃ­sticas de tarjetas." });
    return { ok: false, error: apiError.message, errorMeta: apiError };
  }
};
