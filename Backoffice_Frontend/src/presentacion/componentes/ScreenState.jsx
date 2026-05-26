import { ErrorState } from "@/presentacion/componentes/interfaz/ErrorState";
import { LoadingState } from "@/presentacion/componentes/interfaz/LoadingState";

export const ScreenState = ({ loading, error, loadingLabel = "Cargando..." }) => (
  <div className="space-y-3">
    {loading ? <LoadingState label={loadingLabel} /> : null}
    {error ? <ErrorState message={error} /> : null}
  </div>
);

