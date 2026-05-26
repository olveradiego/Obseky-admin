/**
 * @filePurpose userMappers.js
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
import { toRoleLabel, toStatusLabel } from "../../dominio/constantes/users";

/**
 * @function normalizeString
 * @description Ejecuta la logica asociada a 'normalize string' y retorna su resultado.
 */
const normalizeString = (value) => String(value || "").trim();

/**
 * @function extractId
 * @description Ejecuta la logica asociada a 'extract id' y retorna su resultado.
 */
const extractId = (value) => {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    if (typeof value.$oid === "string") return value.$oid.trim();
    if (typeof value.id === "string") return value.id.trim();
    if (typeof value._id === "string") return value._id.trim();
  }
  return "";
};

/**
 * @function toDomainUser
 * @description Ejecuta la logica asociada a 'to domain user' y retorna su resultado.
 */
export const toDomainUser = (apiItem = {}) => {
  const role = toRoleLabel(apiItem.roleLabel || apiItem.role);
  const status = toStatusLabel(apiItem.status);

  return {
    ...apiItem,
    id: extractId(apiItem.id) || extractId(apiItem._id),
    role,
    status,
  };
};

/**
 * @function toApiCreateUser
 * @description Ejecuta la logica asociada a 'to api create user' y retorna su resultado.
 */
export const toApiCreateUser = (formData = {}) => {
  const payload = {
    companyName: normalizeString(formData.companyName),
    userName: normalizeString(formData.userName),
    email: normalizeString(formData.email).toLowerCase(),
    password: String(formData.password || ""),
    role: toRoleLabel(formData.role),
    status: toStatusLabel(formData.status),
  };

  if (normalizeString(formData.restorePassword) !== "") {
    payload.restorePassword = Number(formData.restorePassword);
  }

  return payload;
};

/**
 * @function toApiUpdateUser
 * @description Ejecuta la logica asociada a 'to api update user' y retorna su resultado.
 */
export const toApiUpdateUser = (formData = {}, patchFields = {}) => {
  const payload = {};

  if (patchFields.companyName) payload.companyName = normalizeString(formData.companyName);
  if (patchFields.userName) payload.userName = normalizeString(formData.userName);
  if (patchFields.email) payload.email = normalizeString(formData.email).toLowerCase();
  if (patchFields.password) payload.password = String(formData.password || "");
  if (patchFields.role) payload.role = toRoleLabel(formData.role);
  if (patchFields.status) payload.status = toStatusLabel(formData.status);

  if (patchFields.restorePassword) {
    payload.restorePassword = normalizeString(formData.restorePassword) === "" ? 0 : Number(formData.restorePassword);
  }

  return payload;
};


