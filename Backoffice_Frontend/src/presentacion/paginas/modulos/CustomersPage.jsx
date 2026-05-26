/**
 * @filePurpose CustomersPage.jsx
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
import { MODULE_KEYS } from "@/dominio/constantes/modules";
import { ModuleCrudPage } from "./ModuleCrudPage";

/**
 * @function CustomersPage
 * @description Ejecuta la logica asociada a 'customers page' y retorna su resultado.
 */
export const CustomersPage = () => <ModuleCrudPage moduleKey={MODULE_KEYS.CUSTOMERS} />;

