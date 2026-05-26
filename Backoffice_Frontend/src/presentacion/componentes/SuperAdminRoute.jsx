/**
 * @filePurpose SuperAdminRoute.jsx
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
import { Navigate, Outlet } from "react-router-dom";
import { MODULE_KEYS } from "../../dominio/constantes/modules";
import { canAccessModule } from "../../dominio/servicios/permissionService";
import { useSession } from "../ganchos/useSession";

/**
 * @function SuperAdminRoute
 * @description Ejecuta la logica asociada a 'super admin route' y retorna su resultado.
 */
export const SuperAdminRoute = () => {
  const { profile, metaConfig } = useSession();

  const canAccessUsers = canAccessModule({
    role: profile?.admin?.role,
    permissions: profile?.permissions,
    permissionsMatrix: metaConfig?.permissionsMatrix,
    moduleKey: MODULE_KEYS.USERS,
  });

  if (!canAccessUsers) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

