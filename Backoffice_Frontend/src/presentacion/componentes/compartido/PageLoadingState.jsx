import { LoadingState } from "@/presentacion/componentes/interfaz/LoadingState";

export const PageLoadingState = ({ loadingLabel = "Cargando..." }) => {
  return <LoadingState label={loadingLabel} />;
};

