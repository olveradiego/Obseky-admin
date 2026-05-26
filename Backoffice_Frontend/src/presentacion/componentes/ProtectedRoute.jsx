/**
 * @filePurpose ProtectedRoute.jsx
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "../ganchos/useSession";
import { ScreenState } from "./ScreenState";

/**
 * @function ProtectedRoute
 * @description Ejecuta la logica asociada a 'protected route' y retorna su resultado.
 */
export const ProtectedRoute = () => {
  const { token, bootstrapping, error } = useSession();

  if (bootstrapping) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <ScreenState loading loadingLabel="Restaurando sesion..." error={error} />
      </main>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

