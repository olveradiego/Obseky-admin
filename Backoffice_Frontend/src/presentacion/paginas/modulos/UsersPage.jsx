/**
 * @filePurpose UsersPage.jsx
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
import { MODULE_KEYS } from "@/dominio/constantes/modules";
import { ModuleCrudPage } from "./ModuleCrudPage";

/**
 * @function UsersPage
 * @description Ejecuta la logica asociada a 'users page' y retorna su resultado.
 */
export const UsersPage = () => <ModuleCrudPage moduleKey={MODULE_KEYS.USERS} />;

