import { MODULE_KEYS } from "../../../dominio/constantes/modules";

export const generateCodesQrUseCase = async ({
  moduleRepository,
  moduleName = MODULE_KEYS.CARD_CODES,
  token,
  numCodes,
  purchaseType,
  companyName = "",
  orderNumber = "",
}) => {
  const normalizedCompanyName = String(companyName || "").trim();
  const normalizedOrderNumber = String(orderNumber || "").trim();
  const payload = {
    ...(normalizedCompanyName ? { companyName: normalizedCompanyName } : {}),
    ...(normalizedOrderNumber ? { orderNumber: normalizedOrderNumber } : {}),
    frontendBaseUrl: import.meta.env.VITE_QR_BASE_URL || window.location.origin,
  };

  return moduleRepository.executeOperation({
    moduleName,
    operation: "generateQr",
    method: "POST",
    token,
    params: { numCodes, purchaseType },
    payload,
    fallbackMessage: "No se pudo generar el lote de codigos QR.",
  });
};

