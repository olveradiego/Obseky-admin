/**
 * @filePurpose useModuleCrud.js
 * @description Hook CRUD por modulo. Orquesta formulario dinamico, permisos y ejecucion de casos de uso.
 */
import { useMemo, useState, useCallback, useEffect } from "react";
import { dispatchModuleCrudUseCase } from "@/aplicacion/casos-de-uso/dispatchModuleCrudUseCase";
import { generateCodesPdfUseCase } from "@/aplicacion/casos-de-uso/codigos/generateCodesPdf";
import { generateCodesQrUseCase } from "@/aplicacion/casos-de-uso/codigos/generateCodesQr";
import { validateCodeCardUseCase } from "@/aplicacion/casos-de-uso/codigos/validateCodeCard";
import {
  buildEndpointCatalogFromMeta,
  buildFormDefaultsFromFields,
  buildPayloadFromForm,
  createPatchFieldsDefault,
  resolveFieldOptions,
} from "@/aplicacion/adaptadores/metaConfigAdapter";
import { toCustomerDomain, toCustomerForm } from "@/aplicacion/mapeadores/customerMappers";
import { toDomainUser } from "@/aplicacion/mapeadores/userMappers";
import { CRUD_NOTICE_MESSAGES } from "@/dominio/constantes/crudMessages";
import { getFieldLabel } from "@/dominio/constantes/fieldLabels";
import { MODULE_KEYS, findModuleDefinition } from "@/dominio/constantes/modules";
import { PERMISSION_MODULE_BY_UI_MODULE } from "@/dominio/constantes/permissions";
import { canRunModuleMethod } from "@/dominio/servicios/permissionService";
import { createModuleRepository } from "@/infraestructura/repositorios/moduleRepository";

const PAGE_SIZE = 10;

/**
 * @function extractIdValue
 * @description Normaliza y extrae un ID desde string, number o estructuras Mongo (_id, id, $oid).
 */
const extractIdValue = (value) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    if (typeof value.$oid === "string") return value.$oid.trim();
    if (typeof value.id === "string") return value.id.trim();
    if (typeof value._id === "string") return value._id.trim();
  }
  return "";
};

/**
 * @function withRowMetadata
 * @description Enriquece cada registro de lista con metadatos de fila para render/seleccion en UI.
 */
const withRowMetadata = (items) =>
  items.map((item, index) => {
    const normalizedId =
      extractIdValue(item?.id) || extractIdValue(item?._id) || extractIdValue(item?.item?.id);
    return {
      ...item,
      __rowId: normalizedId || `row-${index}`,
      __hasRealId: Boolean(normalizedId),
    };
  });

/**
 * @function resolveItemId
 * @description Obtiene el ID efectivo de una fila para operaciones de seleccion y borrado.
 */
const resolveItemId = (item) => {
  if (!item || typeof item !== "object") return "";
  if (typeof item.__rowId === "string") return item.__rowId;
  return extractIdValue(item.id) || extractIdValue(item._id);
};

/**
 * @function toDomainItem
 * @description Aplica mapeo a modelo de dominio segun el modulo (users/customers u otros).
 */
const toDomainItem = ({ moduleName, item }) => {
  if (moduleName === MODULE_KEYS.USERS) return toDomainUser(item);
  if (moduleName === MODULE_KEYS.CUSTOMERS) return toCustomerDomain(item);
  if (moduleName === MODULE_KEYS.ORDERS) return item;
  return item;
};

/**
 * @function toFormItem
 * @description Convierte el item de dominio al shape de formulario cuando el modulo lo requiere.
 */
const toFormItem = ({ moduleName, item }) => {
  if (moduleName === MODULE_KEYS.CUSTOMERS) return toCustomerForm(item);
  if (moduleName === MODULE_KEYS.ORDERS) return item;
  return item;
};

const toTimestamp = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.getTime();
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
};

const toMongoIdTimestamp = (item) => {
  const idCandidate =
    extractIdValue(item?.id) || extractIdValue(item?._id) || extractIdValue(item?.item?.id);
  if (!/^[a-fA-F0-9]{24}$/.test(idCandidate)) return 0;
  return parseInt(idCandidate.slice(0, 8), 16) * 1000;
};

const getRecencyScore = (item) => {
  const direct = Math.max(
    toTimestamp(item?.updatedAt),
    toTimestamp(item?.createdAt),
    toTimestamp(item?.item?.updatedAt),
    toTimestamp(item?.item?.createdAt)
  );
  if (direct > 0) return direct;
  return toMongoIdTimestamp(item);
};

const sortItemsByRecency = (items = []) =>
  [...items]
    .map((item, index) => ({ item, index, score: getRecencyScore(item) }))
    .sort((left, right) => right.score - left.score || right.index - left.index)
    .map((entry) => entry.item);

const parseDownloadFilename = (headers, fallbackName = "codes-qr.pdf") => {
  const disposition = headers?.get?.("content-disposition") || "";
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]).trim();
  const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) return plainMatch[1].trim();
  return fallbackName;
};

const createAutoOrderNumber = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `F-${random}`;
};

const normalizeGeneratedQrItems = (data) => {
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.item?.items)) return data.item.items;
  if (Array.isArray(data?.cards)) return data.cards;
  if (Array.isArray(data?.item?.cards)) return data.item.cards;
  return [];
};

const getFirstDetailMessage = (details) => {
  if (!details) return "";
  if (typeof details === "string") return details.trim();
  if (Array.isArray(details)) {
    for (const item of details) {
      if (typeof item === "string" && item.trim()) return item.trim();
      if (item && typeof item === "object") {
        if (typeof item.message === "string" && item.message.trim()) return item.message.trim();
        if (typeof item.msg === "string" && item.msg.trim()) return item.msg.trim();
      }
    }
    return "";
  }
  if (typeof details === "object") {
    if (typeof details.message === "string" && details.message.trim()) return details.message.trim();
    if (typeof details.msg === "string" && details.msg.trim()) return details.msg.trim();
    for (const value of Object.values(details)) {
      if (typeof value === "string" && value.trim()) return value.trim();
      if (Array.isArray(value) && value.length > 0) {
        const nestedMessage = getFirstDetailMessage(value);
        if (nestedMessage) return nestedMessage;
      }
    }
  }
  return "";
};

const withDetailMessage = (baseMessage, details) => {
  const detail = getFirstDetailMessage(details);
  if (!detail) return baseMessage;
  if (detail.toLowerCase() === String(baseMessage || "").trim().toLowerCase()) return baseMessage;
  return `${baseMessage} (${detail})`;
};

const toOperationState = ({ kind, title, message, code = "", method = "", details = null }) => ({
  kind,
  title,
  message,
  code,
  method,
  details,
  updatedAt: Date.now(),
});

/**
 * @function useModuleCrud
 * @description Hook principal del tester CRUD: integra metadata, permisos, formularios dinamicos y ejecucion de casos de uso.
 */
export const useModuleCrud = ({
  apiBase,
  moduleName,
  token,
  permissions,
  role,
  metaConfig,
  onUnauthorized,
}) => {
  /**
   * @function moduleDefinition
   * @description Calcula la definicion local del modulo activo (label, descripcion y payload por defecto).
   */
  const moduleDefinition = useMemo(() => findModuleDefinition(moduleName), [moduleName]);
  const metaModule = metaConfig?.modulesByKey?.[moduleName] || null;
  /**
   * @function endpointCatalog
   * @description Construye el catalogo de endpoints a partir de metadata remota del backend.
   */
  const endpointCatalog = useMemo(() => buildEndpointCatalogFromMeta(metaConfig), [metaConfig]);
  const moduleRepository = useMemo(
    () => createModuleRepository(apiBase, endpointCatalog),
    [apiBase, endpointCatalog]
  );

  /**
   * @function endpointTemplates
   * @description Resuelve los endpoints CRUD visibles para el modulo actual.
   */
  const endpointTemplates = useMemo(() => {
    if (!metaModule?.endpoints) {
      return {
        list: "",
        getById: "",
        create: "",
        update: "",
        remove: "",
        bulkDelete: "",
      };
    }
    return metaModule.endpoints;
  }, [metaModule]);
  const isCodesModule = moduleName === MODULE_KEYS.CARD_CODES;
  const codesPurchaseTypeOptions = useMemo(() => {
    const byCardcodes = metaConfig?.enums?.cardcodes?.purchaseType;
    const byCodes = metaConfig?.enums?.codes?.purchaseType;
    const values = Array.isArray(byCardcodes) && byCardcodes.length > 0 ? byCardcodes : byCodes;
    return Array.isArray(values) ? values.map((value) => String(value)) : [];
  }, [metaConfig?.enums]);

  /**
   * @function moduleFields
   * @description Obtiene los campos declarados por backend para el modulo activo.
   */
  const moduleFields = useMemo(() => {
    const remoteFields = Array.isArray(metaModule?.fields) ? metaModule.fields : [];
    const localFields = Array.isArray(moduleDefinition?.fields) ? moduleDefinition.fields : [];

    if (remoteFields.length === 0) return localFields;
    if (localFields.length === 0) return remoteFields;

    const localFieldByKey = new Map(
      localFields
        .map((field) => [String(field?.key || "").trim(), field])
        .filter(([key]) => Boolean(key))
    );

    const mergedFields = remoteFields.map((remoteField) => {
      const fieldKey = String(remoteField?.key || "").trim();
      const localField = localFieldByKey.get(fieldKey);
      if (!localField) return remoteField;

      return {
        ...remoteField,
        label: remoteField.label || localField.label || remoteField.key,
        type:
          remoteField.type === "string" && localField.type
            ? localField.type
            : remoteField.type || localField.type || "string",
        values:
          Array.isArray(remoteField.values) && remoteField.values.length > 0
            ? remoteField.values
            : Array.isArray(localField.values)
              ? localField.values
              : [],
        required: typeof remoteField.required === "boolean" ? remoteField.required : Boolean(localField.required),
        mutable: typeof remoteField.mutable === "boolean" ? remoteField.mutable : localField.mutable !== false,
      };
    });

    const mergedKeys = new Set(mergedFields.map((field) => String(field?.key || "").trim()).filter(Boolean));

    for (const localField of localFields) {
      const localKey = String(localField?.key || "").trim();
      if (!localKey || mergedKeys.has(localKey)) continue;
      mergedFields.push(localField);
    }

    return mergedFields;
  }, [metaModule, moduleDefinition]);
  /**
   * @function mutableFields
   * @description Filtra campos editables que pueden enviarse en CREATE/PATCH.
   */
  const mutableFields = useMemo(() => moduleFields.filter((field) => field.mutable), [moduleFields]);

  /**
   * @function moduleFormConfig
   * @description Construye la configuracion de formulario dinamico (tipo, label y opciones).
   */
  const moduleFormConfig = useMemo(() => {
    if (!metaModule) return null;
    return {
      title: `Formulario ${moduleDefinition.label}`,
      fields: mutableFields.map((field) => ({
        key: field.key,
        label: getFieldLabel(field),
        type: field.type === "enum" ? "select" : field.type === "number" ? "number" : "text",
        options: resolveFieldOptions({
          field,
          moduleKey: moduleName,
          enums: metaConfig?.enums,
        }),
      })),
    };
  }, [metaConfig?.enums, metaModule, moduleDefinition.label, moduleName, mutableFields]);

  /**
   * @function moduleSummaryFields
   * @description Deriva un resumen compacto de campos para mostrar informacion clave en la tabla.
   */
  const moduleSummaryFields = useMemo(
    () =>
      mutableFields.slice(0, 4).map((field) => ({
        label: field.key,
        key: field.key,
      })),
    [mutableFields]
  );

  const [requestId, setRequestId] = useState("");
  const [payloadText, setPayloadText] = useState(moduleDefinition.defaultPayload);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [notice, setNotice] = useState({ type: "", message: "" });
  const [operationState, setOperationState] = useState(
    toOperationState({
      kind: "idle",
      title: "Sin actividad",
      message: "Ejecuta una accion CRUD para ver su estado aqui.",
    })
  );
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [allListItems, setAllListItems] = useState([]);
  const [listTotal, setListTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkSummary, setBulkSummary] = useState("");
  const [modulePayloadMode, setModulePayloadMode] = useState("CREATE");
  const formDefaults = useMemo(
    () =>
      buildFormDefaultsFromFields({
        fields: mutableFields,
        enums: metaConfig?.enums || {},
        moduleKey: moduleName,
      }),
    [metaConfig?.enums, moduleName, mutableFields]
  );
  const [moduleFormData, setModuleFormData] = useState(
    formDefaults
  );
  const [modulePatchFields, setModulePatchFields] = useState(createPatchFieldsDefault(mutableFields));
  const [qrBatchForm, setQrBatchForm] = useState({
    numCodes: "10",
    purchaseType: "true",
    companyName: "",
    orderNumber: "",
  });
  const [qrGeneratedItems, setQrGeneratedItems] = useState([]);
  const [qrActionLoading, setQrActionLoading] = useState(false);
  const [cardValidationId, setCardValidationId] = useState("");
  const [cardValidationResult, setCardValidationResult] = useState(null);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((allListItems.length || 0) / PAGE_SIZE)),
    [allListItems.length]
  );
  const effectivePage = Math.min(currentPage, totalPages);
  const paginatedListItems = useMemo(() => {
    const startIndex = (effectivePage - 1) * PAGE_SIZE;
    return allListItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [allListItems, effectivePage]);

  const permissionModuleName = PERMISSION_MODULE_BY_UI_MODULE[moduleName] || moduleName;
  const canGenerateCodes = canRunModuleMethod({
    role,
    permissions,
    permissionsMatrix: metaConfig?.permissionsMatrix,
    moduleKey: permissionModuleName,
    method: "POST",
  });
  const canValidateCards = canRunModuleMethod({
    role,
    permissions,
    permissionsMatrix: metaConfig?.permissionsMatrix,
    moduleKey: permissionModuleName,
    method: "GET",
  });

  /**
   * @function clearSelection
   * @description Limpia la seleccion multiple de filas en la tabla.
   */
  const clearSelection = () => setSelectedIds([]);

  /**
   * @function toggleSelectedId
   * @description Agrega o quita un ID de la seleccion masiva segun el estado del checkbox.
   */
  const toggleSelectedId = (id, checked) => {
    const nextId = String(id || "").trim();
    if (!nextId) return;
    setSelectedIds((previous) => {
      if (checked) return Array.from(new Set([...previous, nextId]));
      return previous.filter((candidate) => candidate !== nextId);
    });
  };

  /**
   * @function setSelectAll
   * @description Selecciona o deselecciona todos los IDs disponibles en la tabla actual.
   */
  const setSelectAll = (checked) => {
    if (!checked) return clearSelection();
    const nextIds = paginatedListItems.map(resolveItemId).filter(Boolean);
    setSelectedIds(Array.from(new Set(nextIds)));
  };

  /**
   * @function buildPayloadTextForMode
   * @description Genera el payload JSON final a partir del formulario, modo y campos habilitados.
   */
  const buildPayloadTextForMode = useCallback((mode, formData, patchFields) => {
    const payload = buildPayloadFromForm({
      fields: mutableFields,
      formData,
      patchFields,
      mode,
    });
    return JSON.stringify(payload, null, 2);
  }, [mutableFields]);

  useEffect(() => {
    const nextPatchFields = createPatchFieldsDefault(mutableFields);
    setModuleFormData(formDefaults);
    setModulePatchFields(nextPatchFields);
    setModulePayloadMode("CREATE");
    setPayloadText(buildPayloadTextForMode("CREATE", formDefaults, nextPatchFields));
    setRequestId("");
  }, [buildPayloadTextForMode, formDefaults, mutableFields, moduleName]);

  /**
   * @function onModulePayloadModeChange
   * @description Cambia entre modo CREATE/PATCH y regenera el payload mostrado.
   */
  const onModulePayloadModeChange = (nextMode) => {
    setModulePayloadMode(nextMode);
    setPayloadText(buildPayloadTextForMode(nextMode, moduleFormData, modulePatchFields));
  };

  const populateForm = useCallback((formData, nextMode = "PATCH") => {
    const normalizedForm = { ...formDefaults, ...(formData || {}) };
    const nextPatchFields = createPatchFieldsDefault(mutableFields);
    for (const field of mutableFields) {
      const value = normalizedForm[field.key];
      nextPatchFields[field.key] = value !== "" && value !== null && value !== undefined;
    }
    setModuleFormData(normalizedForm);
    setModulePatchFields(nextPatchFields);
    setModulePayloadMode(nextMode);
    setPayloadText(buildPayloadTextForMode(nextMode, normalizedForm, nextPatchFields));
    return normalizedForm;
  }, [buildPayloadTextForMode, formDefaults, mutableFields]);

  const resetForm = useCallback((nextMode = "CREATE") => {
    const nextPatchFields = createPatchFieldsDefault(mutableFields);
    setModuleFormData(formDefaults);
    setModulePatchFields(nextPatchFields);
    setModulePayloadMode(nextMode);
    setPayloadText(buildPayloadTextForMode(nextMode, formDefaults, nextPatchFields));
    if (nextMode === "CREATE") setRequestId("");
  }, [buildPayloadTextForMode, formDefaults, mutableFields]);

  /**
   * @function onModuleFormFieldChange
   * @description Actualiza un campo del formulario y sincroniza el payload JSON en tiempo real.
   */
  const onModuleFormFieldChange = (field, value) => {
    setModuleFormData((previous) => {
      const nextForm = { ...previous, [field]: value };
      setPayloadText(buildPayloadTextForMode(modulePayloadMode, nextForm, modulePatchFields));
      return nextForm;
    });
  };

  /**
   * @function onModulePatchFieldToggle
   * @description Activa o desactiva campos permitidos para PATCH y recalcula payload si aplica.
   */
  const onModulePatchFieldToggle = (field, checked) => {
    setModulePatchFields((previous) => {
      const nextPatchFields = { ...previous, [field]: checked };
      if (modulePayloadMode === "PATCH") {
        setPayloadText(buildPayloadTextForMode("PATCH", moduleFormData, nextPatchFields));
      }
      return nextPatchFields;
    });
  };

  const onQrBatchFieldChange = (field, value) => {
    setQrBatchForm((previous) => ({ ...previous, [field]: value }));
  };

  const runGenerateQrBatch = async () => {
    if (!isCodesModule) return;
    if (!endpointTemplates.generateQr) {
      setNotice({ type: "error", message: "El endpoint generateQr no esta disponible en metadata." });
      return { ok: false };
    }
    if (!canGenerateCodes) {
      setNotice({ type: "forbidden", message: CRUD_NOTICE_MESSAGES.permissionDenied("POST", moduleName) });
      return { ok: false };
    }

    const numCodes = Number.parseInt(String(qrBatchForm.numCodes || "").trim(), 10);
    if (!Number.isFinite(numCodes) || numCodes <= 0) {
      setNotice({ type: "error", message: "numCodes debe ser un entero positivo." });
      return { ok: false };
    }
    const purchaseTypeRaw = String(qrBatchForm.purchaseType || "").trim().toLowerCase();
    if (purchaseTypeRaw !== "true" && purchaseTypeRaw !== "false") {
      setNotice({ type: "error", message: "purchaseType debe ser true o false." });
      return { ok: false };
    }
    const autoOrderNumber = createAutoOrderNumber();
    setQrBatchForm((previous) => ({ ...previous, orderNumber: autoOrderNumber }));

    setQrActionLoading(true);
    setCardValidationResult(null);
    const result = await generateCodesQrUseCase({
      moduleRepository,
      moduleName,
      token,
      numCodes,
      purchaseType: purchaseTypeRaw,
      companyName: String(qrBatchForm.companyName || "").trim(),
      orderNumber: autoOrderNumber,
    });

    if (!result.ok) {
      const nextErrorCode = result.error?.code || "";
      const nextDetails = result.error?.details ?? null;
      const nextMessage = withDetailMessage(
        result.error?.message || "No se pudo generar el lote QR.",
        nextDetails
      );
      setErrorCode(nextErrorCode);
      setError(nextMessage);
      setNotice({ type: nextErrorCode === "FORBIDDEN" ? "forbidden" : "error", message: nextMessage });
      setOperationState(
        toOperationState({
          kind: "error",
          title: "Generacion QR fallida",
          message: nextMessage,
          code: nextErrorCode,
          method: "POST",
          details: nextDetails,
        })
      );
      setQrActionLoading(false);
      return { ok: false, numCodes };
    }

    const items = normalizeGeneratedQrItems(result.data).map((item, index) => ({
      ...item,
      __idx: index + 1,
    }));
    setQrGeneratedItems(items);
    const message = result.data?.message || `Se generaron ${items.length} codigos QR.`;
    setNotice({ type: "success", message });
    setOperationState(
      toOperationState({
        kind: items.length > 0 ? "success" : "empty",
        title: items.length > 0 ? "Lote QR generado" : "Sin resultados",
        message,
        method: "POST",
      })
    );
    setQrActionLoading(false);
    return { ok: true, numCodes };
  };

  const runGeneratePdf = async ({ numOverride } = {}) => {
    if (!isCodesModule) return;
    if (!endpointTemplates.generatePdf) {
      setNotice({ type: "error", message: "El endpoint generatePdf no esta disponible en metadata." });
      return { ok: false };
    }
    if (!canGenerateCodes) {
      setNotice({ type: "forbidden", message: CRUD_NOTICE_MESSAGES.permissionDenied("POST", moduleName) });
      return { ok: false };
    }

    const numSource = Number.isFinite(numOverride) ? String(numOverride) : String(qrBatchForm.numCodes || "");
    const num = Number.parseInt(numSource.trim(), 10);
    if (!Number.isFinite(num) || num <= 0) {
      setNotice({ type: "error", message: "Indica un numero valido de codigos para generar PDF." });
      return { ok: false };
    }

    setQrActionLoading(true);
    const result = await generateCodesPdfUseCase({
      moduleRepository,
      moduleName,
      token,
      num,
    });

    if (!result.ok) {
      const nextErrorCode = result.error?.code || "";
      const nextDetails = result.error?.details ?? null;
      const nextMessage = withDetailMessage(
        result.error?.message || "No se pudo descargar el PDF.",
        nextDetails
      );
      setErrorCode(nextErrorCode);
      setError(nextMessage);
      setNotice({ type: nextErrorCode === "FORBIDDEN" ? "forbidden" : "error", message: nextMessage });
      setOperationState(
        toOperationState({
          kind: "error",
          title: "Descarga PDF fallida",
          message: nextMessage,
          code: nextErrorCode,
          method: "GET",
          details: nextDetails,
        })
      );
      setQrActionLoading(false);
      return { ok: false, num };
    }

    const blob = result.data?.blob;
    const headers = result.data?.headers;
    if (blob) {
      const filename = parseDownloadFilename(headers, `codes-${num}.pdf`);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      const message = `PDF generado correctamente (${filename}).`;
      setNotice({ type: "success", message });
      setOperationState(
        toOperationState({
          kind: "success",
          title: "PDF descargado",
          message,
          method: "GET",
        })
      );
    }

    setQrActionLoading(false);
    return { ok: true, num };
  };

  const runGenerateQrBatchAndPdf = async () => {
    const generateResult = await runGenerateQrBatch();
    if (!generateResult?.ok) return generateResult;
    return runGeneratePdf({ numOverride: generateResult.numCodes });
  };

  const runValidateCard = async () => {
    if (!isCodesModule) return;
    if (!endpointTemplates.validateCard) {
      setNotice({ type: "error", message: "El endpoint validateCard no esta disponible en metadata." });
      return;
    }
    if (!canValidateCards) {
      setNotice({ type: "forbidden", message: CRUD_NOTICE_MESSAGES.permissionDenied("GET", moduleName) });
      return;
    }

    const targetId = String(cardValidationId || "").trim();
    if (!targetId) {
      setNotice({ type: "error", message: "Debes indicar el ID de la tarjeta a validar." });
      return;
    }

    setQrActionLoading(true);
    const result = await validateCodeCardUseCase({
      moduleRepository,
      moduleName,
      token,
      id: targetId,
    });

    if (!result.ok) {
      const nextErrorCode = result.error?.code || "";
      const nextDetails = result.error?.details ?? null;
      const nextMessage = withDetailMessage(
        result.error?.message || "No se pudo validar la tarjeta.",
        nextDetails
      );
      setCardValidationResult({
        ok: false,
        code: nextErrorCode,
        message: nextMessage,
      });
      setNotice({ type: "error", message: nextMessage });
      setOperationState(
        toOperationState({
          kind: "error",
          title: "Validacion fallida",
          message: nextMessage,
          code: nextErrorCode,
          method: "GET",
          details: nextDetails,
        })
      );
      setQrActionLoading(false);
      return;
    }

    const payload = result.data?.item || result.data || {};
    const status = String(payload?.status || "").trim().toLowerCase();
    const isValid = status === "activo" || status === "active" || payload?.valid === true;
    const message = isValid ? "Tarjeta valida/activa." : "Tarjeta inactiva o no valida.";
    setCardValidationResult({
      ok: isValid,
      code: "",
      message,
      data: payload,
    });
    setNotice({ type: isValid ? "success" : "error", message });
    setOperationState(
      toOperationState({
        kind: isValid ? "success" : "empty",
        title: isValid ? "Tarjeta valida" : "Tarjeta inactiva",
        message,
        method: "GET",
      })
    );
    setQrActionLoading(false);
  };

  /**
   * @function run
   * @description Ejecuta una operacion CRUD individual validando permisos, endpoints y feedback de resultado.
   */
  const run = useCallback(async (method, options = {}) => {
    const { id, payload, queryParams, confirmMessage } = options;
    const permissionMethod = method === "GET_LIST" ? "GET" : method;
    const effectiveRequestId = method === "GET_LIST" ? "" : (id || requestId);

    setLoading(true);
    setError("");
    setErrorCode("");
    setNotice({ type: "", message: "" });
    setBulkSummary("");
    setOperationState(
      toOperationState({
        kind: "loading",
        title: "Procesando",
        message: `Ejecutando ${permissionMethod}...`,
        method: permissionMethod,
      })
    );

    if (!metaModule?.endpoints) {
      const message = "No hay metadata de endpoints para este modulo.";
      setError(message);
      setNotice({ type: "error", message });
      setOperationState(
        toOperationState({
          kind: "error",
          title: "Error de configuracion",
          message,
          method: permissionMethod,
        })
      );
      setLoading(false);
      return;
    }

    const hasPermission = canRunModuleMethod({
      role,
      permissions,
      permissionsMatrix: metaConfig?.permissionsMatrix,
      moduleKey: permissionModuleName,
      method: permissionMethod,
    });

    if (!hasPermission) {
      const message = CRUD_NOTICE_MESSAGES.permissionDenied(permissionMethod, moduleName);
      setError(message);
      setErrorCode("FORBIDDEN");
      setNotice({ type: "forbidden", message });
      setOperationState(
        toOperationState({
          kind: "error",
          title: "Sin permiso",
          message,
          code: "FORBIDDEN",
          method: permissionMethod,
        })
      );
      setLoading(false);
      return;
    }

    if (permissionMethod === "DELETE" && !window.confirm(confirmMessage || CRUD_NOTICE_MESSAGES.deleteConfirm)) {
      setOperationState(
        toOperationState({
          kind: "idle",
          title: "Operacion cancelada",
          message: "No se ejecuto DELETE.",
          method: permissionMethod,
        })
      );
      setLoading(false);
      return;
    }

    const result = await dispatchModuleCrudUseCase({
      moduleRepository,
      method: permissionMethod,
      moduleName,
      id: effectiveRequestId,
      payloadText: payload || (
        modulePayloadMode === "CREATE" || modulePayloadMode === "PATCH"
          ? buildPayloadTextForMode(permissionMethod === "PATCH" ? "PATCH" : "CREATE", moduleFormData, modulePatchFields)
          : payloadText),
      token,
      moduleFields,
      filters: queryParams,
    });

    if (!result.ok) {
      const nextErrorCode = result.error?.code || "";
      const nextMessage = result.error?.message || CRUD_NOTICE_MESSAGES.operationFailed;
      setErrorCode(nextErrorCode);
      setError(nextMessage);
      setNotice({
        type: nextErrorCode === "FORBIDDEN" ? "forbidden" : "error",
        message: nextMessage,
      });
      setOperationState(
        toOperationState({
          kind: "error",
          title: "Operacion fallida",
          message: nextMessage,
          code: nextErrorCode,
          method: permissionMethod,
        })
      );
      if (nextErrorCode === "UNAUTHORIZED" && typeof onUnauthorized === "function") onUnauthorized();
      clearSelection();
      setLoading(false);
      return;
    }

    if (permissionMethod === "GET" && !effectiveRequestId) {
      const rawItems = Array.isArray(result.data?.items) ? result.data.items : [];
      const nextItems = withRowMetadata(sortItemsByRecency(rawItems));
      const nextTotal = typeof result.data?.total === "number" ? result.data.total : nextItems.length;
      setAllListItems(nextItems);
      setListTotal(nextTotal);
      setCurrentPage(1);
      clearSelection();
      setNotice({ type: "success", message: CRUD_NOTICE_MESSAGES.listLoaded });
      setOperationState(
        toOperationState({
          kind: nextTotal === 0 ? "empty" : "success",
          title: nextTotal === 0 ? "Sin datos" : "Consulta exitosa",
          message:
            nextTotal === 0
              ? "La consulta se completo correctamente, pero no hay registros para mostrar."
              : `Se cargaron ${nextTotal} registros.`,
          method: permissionMethod,
        })
      );
    } else if (permissionMethod === "GET" && effectiveRequestId) {
      const domainItem = toDomainItem({ moduleName, item: result.data?.item || {} });
      const formItem = toFormItem({ moduleName, item: domainItem });
      populateForm(formItem, "PATCH");
      setNotice({ type: "success", message: CRUD_NOTICE_MESSAGES.detailLoaded });
      setOperationState(
        toOperationState({
          kind: "success",
          title: "Detalle cargado",
          message: CRUD_NOTICE_MESSAGES.detailLoaded,
          method: permissionMethod,
        })
      );
    } else if (permissionMethod === "POST") {
      const successMessage = result.data?.message || CRUD_NOTICE_MESSAGES.createSuccess;
      setNotice({ type: "success", message: successMessage });
      setOperationState(
        toOperationState({
          kind: "success",
          title: "Creacion completada",
          message: successMessage,
          method: permissionMethod,
        })
      );
    } else if (permissionMethod === "PATCH") {
      const successMessage = result.data?.message || CRUD_NOTICE_MESSAGES.updateSuccess;
      setNotice({ type: "success", message: successMessage });
      setOperationState(
        toOperationState({
          kind: "success",
          title: "Actualizacion completada",
          message: successMessage,
          method: permissionMethod,
        })
      );
    } else if (permissionMethod === "DELETE") {
      const deletedId = String(result.data?.item?.id || effectiveRequestId).trim();
      if (deletedId) {
        setAllListItems((previous) => previous.filter((item) => resolveItemId(item) !== deletedId));
        setListTotal((previous) => Math.max(0, previous - 1));
      }
      clearSelection();
      const successMessage = result.data?.message || CRUD_NOTICE_MESSAGES.deleteSuccess;
      setNotice({ type: "success", message: successMessage });
      setOperationState(
        toOperationState({
          kind: "success",
          title: "Eliminacion completada",
          message: successMessage,
          method: permissionMethod,
        })
      );
    }

    setLoading(false);
    return result;
  }, [
    metaConfig, moduleName, role, permissions, onUnauthorized,
    moduleRepository, moduleFields, permissionModuleName, metaModule,
    requestId, payloadText, modulePayloadMode, moduleFormData, modulePatchFields, token, buildPayloadTextForMode,
    populateForm
  ]);

  /**
   * @function runBulkDelete
   * @description Ejecuta eliminacion masiva con confirmacion, control de permisos y resumen final.
   */
  const runBulkDelete = async () => {
    setLoading(true);
    setError("");
    setErrorCode("");
    setNotice({ type: "", message: "" });
    setBulkSummary("");
    setOperationState(
      toOperationState({
        kind: "loading",
        title: "Procesando",
        message: "Ejecutando BULK_DELETE...",
        method: "BULK_DELETE",
      })
    );

    const hasPermission = canRunModuleMethod({
      role,
      permissions,
      permissionsMatrix: metaConfig?.permissionsMatrix,
      moduleKey: permissionModuleName,
      method: "DELETE",
    });

    if (!hasPermission) {
      const message = CRUD_NOTICE_MESSAGES.permissionDenied("DELETE", moduleName);
      setError(message);
      setErrorCode("FORBIDDEN");
      setNotice({ type: "forbidden", message });
      setOperationState(
        toOperationState({
          kind: "error",
          title: "Sin permiso",
          message,
          code: "FORBIDDEN",
          method: "BULK_DELETE",
        })
      );
      setLoading(false);
      return;
    }

    if (selectedIds.length === 0) {
      const message = CRUD_NOTICE_MESSAGES.bulkSelectionRequired;
      setError(message);
      setNotice({ type: "error", message });
      setOperationState(
        toOperationState({
          kind: "error",
          title: "Seleccion vacia",
          message,
          method: "BULK_DELETE",
        })
      );
      setLoading(false);
      return;
    }

    if (!window.confirm(CRUD_NOTICE_MESSAGES.bulkDeleteConfirm(selectedIds.length))) {
      setOperationState(
        toOperationState({
          kind: "idle",
          title: "Operacion cancelada",
          message: "No se ejecuto BULK_DELETE.",
          method: "BULK_DELETE",
        })
      );
      setLoading(false);
      return;
    }

    const result = await dispatchModuleCrudUseCase({
      moduleRepository,
      method: "BULK_DELETE",
      moduleName,
      selectedIds,
      payloadText,
      token,
      id: "",
      moduleFields,
    });

    if (!result.ok) {
      const nextErrorCode = result.error?.code || "";
      const nextMessage = result.error?.message || CRUD_NOTICE_MESSAGES.bulkFailed;
      setErrorCode(nextErrorCode);
      setError(nextMessage);
      setNotice({
        type: nextErrorCode === "FORBIDDEN" ? "forbidden" : "error",
        message: nextMessage,
      });
      setOperationState(
        toOperationState({
          kind: "error",
          title: "Eliminacion masiva fallida",
          message: nextMessage,
          code: nextErrorCode,
          method: "BULK_DELETE",
        })
      );
      clearSelection();
      if (nextErrorCode === "UNAUTHORIZED" && typeof onUnauthorized === "function") onUnauthorized();
      setLoading(false);
      return;
    }

    const deletedIds = Array.isArray(result.data?.deletedIds) ? result.data.deletedIds : [];
    if (deletedIds.length > 0) {
      /**
       * @function deletedSet
       * @description Conjunto auxiliar para filtrar eficientemente filas eliminadas en la UI.
       */
      const deletedSet = new Set(deletedIds.map((candidate) => String(candidate)));
      setAllListItems((previous) => previous.filter((item) => !deletedSet.has(resolveItemId(item))));
    }

    const summaryMessage = CRUD_NOTICE_MESSAGES.bulkSummary({
      message: result.data?.message || CRUD_NOTICE_MESSAGES.bulkComplete,
      deletedCount: result.data?.deletedCount || 0,
      notFoundCount: result.data?.notFoundCount || 0,
    });

    setListTotal((previous) => Math.max(0, previous - (result.data?.deletedCount || 0)));
    setBulkSummary(summaryMessage);
    setNotice({ type: "success", message: summaryMessage });
    setOperationState(
      toOperationState({
        kind: (result.data?.deletedCount || 0) > 0 ? "success" : "empty",
        title: (result.data?.deletedCount || 0) > 0 ? "Eliminacion masiva completada" : "Sin cambios",
        message: summaryMessage,
        method: "BULK_DELETE",
      })
    );
    clearSelection();
    setLoading(false);
    return result;
  };

  return {
    moduleFields,
    mutableFields,
    moduleDefinition,
    endpointTemplates,
    moduleFormConfig,
    moduleSummaryFields,
    modulePayloadMode,
    moduleFormData,
    modulePatchFields,
    formDefaults,
    requestId,
    setRequestId,
    payloadText,
    setPayloadText,
    loading,
    error,
    errorCode,
    notice,
    operationState,
    selectedIds,
    allListItems,
    listItems: paginatedListItems,
    listTotal,
    currentPage: effectivePage,
    totalPages,
    pageSize: PAGE_SIZE,
    setCurrentPage,
    codesTools: {
      enabled: isCodesModule,
      canGenerateCodes,
      canValidateCards,
      endpoints: {
        generateQr: endpointTemplates.generateQr || "",
        generatePdf: endpointTemplates.generatePdf || "",
        validateCard: endpointTemplates.validateCard || "",
      },
      purchaseTypeOptions: codesPurchaseTypeOptions,
      qrBatchForm,
      setQrBatchField: onQrBatchFieldChange,
      qrGeneratedItems,
      cardValidationId,
      setCardValidationId,
      cardValidationResult,
      runGenerateQrBatch,
      runGenerateQrBatchAndPdf,
      runGeneratePdf,
      runValidateCard,
      loading: qrActionLoading,
    },
    bulkSummary,
    onModulePayloadModeChange,
    onModuleFormFieldChange,
    onModulePatchFieldToggle,
    populateForm,
    resetForm,
    resolveItemId,
    toggleSelectedId,
    setSelectAll,
    clearSelection,
    run,
    runBulkDelete,
  };
};

