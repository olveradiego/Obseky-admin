/**
 * @filePurpose useSession.js
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
import { useContext } from "react";
import { SessionContext } from "@/presentacion/contexto/sessionContextValue";

/**
 * @function useSession
 * @description Ejecuta la logica asociada a 'use session' y retorna su resultado.
 */
export const useSession = () => {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession debe usarse dentro de SessionProvider.");
  }
  return value;
};

