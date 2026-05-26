import { ErrorState } from "@/presentacion/componentes/interfaz/ErrorState";

export const PageErrorState = ({ error }) => {
  const errorMessage = typeof error === "string" ? error : error?.message || "Ocurrio un error desconocido.";
  return <ErrorState message={errorMessage} />;
};

