import { MODULE_KEYS } from "../../../dominio/constantes/modules";

export const generateCodesPdfUseCase = async ({
  moduleRepository,
  moduleName = MODULE_KEYS.CARD_CODES,
  token,
  num,
}) =>
  moduleRepository.executeBinaryOperation({
    moduleName,
    operation: "generatePdf",
    method: "GET",
    token,
    params: { 
      num,
      frontendBaseUrl: import.meta.env.VITE_QR_BASE_URL || window.location.origin,
    },
    fallbackMessage: "No se pudo generar el PDF de tarjetas QR.",
  });


