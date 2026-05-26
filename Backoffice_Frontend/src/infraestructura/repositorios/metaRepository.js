/**
 * @filePurpose metaRepository.js
 * @description Repositorio para obtener metadata remota del backend.
 */
import { createHttpClient } from "../http/httpClient";
import { ENDPOINTS } from "../http/endpoints";

/**
 * @function createMetaRepository
 * @description Crea el repositorio para consultar metadata funcional del backend.
 */
export const createMetaRepository = (apiBase) => {
  const httpClient = createHttpClient(apiBase);

  /**
   * @function getMeta
   * @description Recupera `version`, `modules`, `enums` y `permissionsMatrix` para bootstrap de sesion.
   */
  const getMeta = async (token) =>
    httpClient.request({
      path: ENDPOINTS.auth.meta,
      method: "GET",
      token,
      fallbackMessage: "No se pudo cargar metadata de configuracion.",
    });

  return { getMeta };
};

