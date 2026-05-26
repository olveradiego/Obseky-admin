import { mapApiError } from "@/aplicacion/errores/mapApiError";

/**
 * @filePurpose getExpensesByCategoryUseCase.js
 * @description Caso de uso para obtener los gastos desglosados por categorÃ­a.
 */
export const getExpensesByCategoryUseCase = async ({
  moduleRepository,
  token,
  companyName,
  startDate,
  endDate,
}) => {
  try {
    const result = await moduleRepository.getExpensesByCategory({ token, companyName, startDate, endDate });
    if (!result.ok) {
      const apiError = result.error || mapApiError({ fallbackMessage: "No se pudieron cargar los gastos por categorÃ­a." });
      return { ok: false, error: apiError.message, errorMeta: apiError };
    }
    return { ok: true, data: result.data };
  } catch (error) {
    const apiError = mapApiError({ error, fallbackMessage: "Error de red o backend no disponible al obtener gastos por categorÃ­a." });
    return { ok: false, error: apiError.message, errorMeta: apiError };
  }
};
