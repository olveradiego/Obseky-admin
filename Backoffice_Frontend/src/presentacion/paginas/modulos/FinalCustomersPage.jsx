/**
 * @filePurpose FinalCustomersPage.jsx
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
import { MODULE_KEYS } from "@/dominio/constantes/modules";
import { ModuleCrudPage } from "./ModuleCrudPage";

/**
 * @function FinalCustomersPage
 * @description Ejecuta la logica asociada a 'final customers page' y retorna su resultado.
 */
export const FinalCustomersPage = () => <ModuleCrudPage moduleKey={MODULE_KEYS.FINAL_CUSTOMERS} />;

