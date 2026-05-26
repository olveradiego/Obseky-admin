/**
 * @filePurpose metaConfigAdapter.js
 * @description Adaptador de metadata backend a configuracion utilizable en frontend.
 */
/**
 * @function toArray
 * @description Ejecuta la logica asociada a 'to array' y retorna su resultado.
 */
const toArray = (value) => (Array.isArray(value) ? value : []);
/**
 * @function isObject
 * @description Ejecuta la logica asociada a 'is object' y retorna su resultado.
 */
const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * @function normalizePath
 * @description Ejecuta la logica asociada a 'normalize path' y retorna su resultado.
 */
const normalizePath = (value) => {
  const path = String(value || "").trim();
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
};

/**
 * @function normalizeField
 * @description Ejecuta la logica asociada a 'normalize field' y retorna su resultado.
 */
const normalizeField = (field) => {
  if (!isObject(field)) return null;
  return {
    key: String(field.key || "").trim(),
    type: String(field.type || "string").trim().toLowerCase(),
    required: Boolean(field.required),
    mutable: field.mutable !== false,
    values: toArray(field.values).map((value) => String(value)),
  };
};

/**
 * @function buildModuleMap
 * @description Ejecuta la logica asociada a 'build module map' y retorna su resultado.
 */
const buildModuleMap = (modules) => {
  const nextModules = {};
  for (const moduleItem of toArray(modules)) {
    if (!isObject(moduleItem)) continue;
    const moduleKey = String(moduleItem.key || "").trim();
    if (!moduleKey) continue;
    const endpoints = isObject(moduleItem.endpoints) ? moduleItem.endpoints : {};
    const fields = toArray(moduleItem.fields).map(normalizeField).filter(Boolean);

    const normalizedEndpoints = Object.fromEntries(
      Object.entries(endpoints).map(([key, value]) => [
        key === "delete" ? "remove" : key,
        normalizePath(value),
      ])
    );

    nextModules[moduleKey] = {
      key: moduleKey,
      resource: String(moduleItem.resource || moduleKey).trim(),
      endpoints: {
        list: normalizedEndpoints.list || "",
        getById: normalizedEndpoints.getById || "",
        create: normalizedEndpoints.create || "",
        update: normalizedEndpoints.update || "",
        remove: normalizedEndpoints.remove || "",
        bulkDelete: normalizedEndpoints.bulkDelete || "",
        ...normalizedEndpoints,
      },
      fields,
    };
  }
  return nextModules;
};

/**
 * @function buildMetaConfig
 * @description Ejecuta la logica asociada a 'build meta config' y retorna su resultado.
 */
export const buildMetaConfig = (metaRaw) => {
  const modulesByKey = buildModuleMap(metaRaw?.modules);
  return {
    version: String(metaRaw?.version || "").trim(),
    modulesByKey,
    moduleKeys: Object.keys(modulesByKey),
    enums: isObject(metaRaw?.enums) ? metaRaw.enums : {},
    permissionsMatrix: isObject(metaRaw?.permissionsMatrix) ? metaRaw.permissionsMatrix : {},
  };
};

/**
 * @function buildEndpointCatalogFromMeta
 * @description Ejecuta la logica asociada a 'build endpoint catalog from meta' y retorna su resultado.
 */
export const buildEndpointCatalogFromMeta = (metaConfig) => {
  const catalog = {};
  for (const [moduleKey, moduleConfig] of Object.entries(metaConfig?.modulesByKey || {})) {
    catalog[moduleKey] = moduleConfig.endpoints;
  }
  return catalog;
};

/**
 * @function createPatchFieldsDefault
 * @description Ejecuta la logica asociada a 'create patch fields default' y retorna su resultado.
 */
export const createPatchFieldsDefault = (fields) =>
  toArray(fields).reduce((acc, field) => ({ ...acc, [field.key]: false }), {});

/**
 * @function buildFormDefaultsFromFields
 * @description Ejecuta la logica asociada a 'build form defaults from fields' y retorna su resultado.
 */
export const buildFormDefaultsFromFields = ({ fields = [], enums = {}, moduleKey = "" }) => {
  const moduleEnums = isObject(enums?.[moduleKey]) ? enums[moduleKey] : {};
  const defaults = {};

  for (const field of fields) {
    const enumValues =
      field.type === "enum"
        ? field.values.length > 0
          ? field.values
          : toArray(moduleEnums?.[field.key])
        : [];
    defaults[field.key] = enumValues.length > 0 ? enumValues[0] : "";
  }

  return defaults;
};

/**
 * @function resolveFieldOptions
 * @description Ejecuta la logica asociada a 'resolve field options' y retorna su resultado.
 */
export const resolveFieldOptions = ({ field, moduleKey, enums }) => {
  if (field.type !== "enum") return [];
  if (field.values.length > 0) return field.values;
  return toArray(enums?.[moduleKey]?.[field.key]).map((value) => String(value));
};

/**
 * @function buildPayloadFromForm
 * @description Ejecuta la logica asociada a 'build payload from form' y retorna su resultado.
 */
export const buildPayloadFromForm = ({ fields = [], formData = {}, patchFields = {}, mode = "CREATE" }) => {
  const payload = {};
  for (const field of fields) {
    if (!field.mutable) continue;
    if (mode === "PATCH" && !patchFields[field.key]) continue;
    const value = formData[field.key];
    if (field.type === "number") {
      if (String(value || "").trim() === "") continue;
      payload[field.key] = Number(value);
      continue;
    }
    payload[field.key] = typeof value === "string" ? value.trim() : value ?? "";
  }
  return payload;
};

