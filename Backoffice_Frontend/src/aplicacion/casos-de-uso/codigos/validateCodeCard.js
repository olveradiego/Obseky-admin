import { MODULE_KEYS } from "../../../dominio/constantes/modules";

export const validateCodeCardUseCase = async ({
  moduleRepository,
  moduleName = MODULE_KEYS.CARD_CODES,
  token,
  id,
}) =>
  moduleRepository.executeOperation({
    moduleName,
    operation: "validateCard",
    method: "GET",
    token,
    params: { id },
    fallbackMessage: "No se pudo validar la tarjeta.",
  });


