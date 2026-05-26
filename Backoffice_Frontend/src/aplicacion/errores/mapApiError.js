/**
 * @filePurpose mapApiError.js
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
import { parseBackendError, parseTransportError } from "../../infraestructura/http/errorParser";

export const mapApiError = ({
  status = 0,
  data,
  error,
  fallbackMessage = "La operacion no se pudo completar.",
}) => {
  if (error) {
    return parseTransportError({ error, fallbackMessage });
  }

  return parseBackendError({ status, data, fallbackMessage });
};

