/**
 * @filePurpose moduleCrudUi.js
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
import { CUSTOMER_FORM_FIELDS } from "./customers";
import { MODULE_KEYS } from "./modules";
import { USERS_FORM_FIELDS } from "./users";

export const MODULE_FORM_CONFIG_BY_KEY = {
  [MODULE_KEYS.USERS]: {
    title: "Formulario Users",
    fields: USERS_FORM_FIELDS,
  },
  [MODULE_KEYS.CUSTOMERS]: {
    title: "Formulario Customers",
    fields: CUSTOMER_FORM_FIELDS,
  },
};

export const MODULE_SUMMARY_FIELDS_BY_KEY = {
  [MODULE_KEYS.USERS]: [
    { label: "Usuario", key: "userName" },
    { label: "Empresa", key: "companyName" },
    { label: "Rol", key: "role" },
    { label: "Status", key: "status" },
  ],
  [MODULE_KEYS.CUSTOMERS]: [
    { label: "Empresa", key: "businessName" },
    { label: "Cliente", key: "customerName" },
    { label: "orderStatus", key: "orderStatus" },
    { label: "status", key: "status" },
  ],
};

