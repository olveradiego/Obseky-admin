import { mapApiError } from "@/aplicacion/errores/mapApiError";

/**
 * @filePurpose getFinancialSummaryUseCase.js
 * @description Caso de uso para obtener el resumen financiero.
 */
export const getFinancialSummaryUseCase = async ({
  moduleRepository,
  token,
  companyName,
  startDate,
  endDate,
}) => {
  try {
    const result = await moduleRepository.getFinancialSummary({ token, companyName, startDate, endDate });

    if (!result.ok) {
      const apiError = result.error || mapApiError({ fallbackMessage: "No se pudo cargar el resumen financiero." });
      return { ok: false, error: apiError.message, errorMeta: apiError };
    }

    return { ok: true, data: result.data };
  } catch (error) {
    const apiError = mapApiError({ error, fallbackMessage: "Error de red o backend no disponible al obtener resumen financiero." });
    return { ok: false, error: apiError.message, errorMeta: apiError };
  }
};

