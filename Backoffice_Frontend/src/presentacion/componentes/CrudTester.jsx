import { useMemo, useState } from "react";
import { Download, Eye, FileText, KeyRound, ListChecks, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { DataTable } from "@/presentacion/componentes/interfaz/DataTable";
import { EmptyState } from "@/presentacion/componentes/interfaz/EmptyState";
import { ErrorState } from "@/presentacion/componentes/interfaz/ErrorState";
import { FormActions } from "@/presentacion/componentes/interfaz/FormActions";
import { FormField } from "@/presentacion/componentes/interfaz/FormField";
import { FormSection } from "@/presentacion/componentes/interfaz/FormSection";
import { ModuleToolbar } from "@/presentacion/componentes/interfaz/ModuleToolbar";
import { PermissionHint } from "@/presentacion/componentes/interfaz/PermissionHint";
import { SearchField } from "@/presentacion/componentes/interfaz/SearchField";
import { StatusBadge } from "@/presentacion/componentes/interfaz/StatusBadge";
import { SurfacePanel } from "@/presentacion/componentes/interfaz/SurfacePanel";

const resolveFieldOptions = (field) => (Array.isArray(field.options) ? field.options : []);

const NoticeBanner = ({ notice }) => {
  if (!notice?.message) return null;
  return notice.type === "success" ? (
    <div className="status-ok rounded-2xl px-4 py-3 text-sm font-medium">{notice.message}</div>
  ) : (
    <ErrorState
      title={notice.type === "forbidden" ? "Permiso insuficiente" : "Operacion fallida"}
      message={notice.message}
      className="p-4"
    />
  );
};

export const CrudTester = ({
  moduleDefinition,
  endpointTemplates,
  moduleFormConfig,
  moduleSummaryFields,
  modulePayloadMode,
  moduleFormData,
  modulePatchFields,
  requestId,
  payloadText,
  loading,
  error,
  notice,
  codesTools,
  selectedIds,
  listItems,
  listTotal,
  currentPage,
  totalPages,
  bulkSummary,
  onModulePayloadModeChange,
  onModuleFormFieldChange,
  onModulePatchFieldToggle,
  onRequestIdChange,
  onPayloadChange,
  onRun,
  onToggleSelectedId,
  onSetSelectAll,
  onPageChange,
  onRunBulkDelete,
}) => {
  const [pageInput, setPageInput] = useState(String(currentPage || 1));
  const isCodesModule = Boolean(codesTools?.enabled);
  const [codesEditFields, setCodesEditFields] = useState({
    purchaseType: false,
    status: false,
    companyName: false,
  });
  const [codesEditForm, setCodesEditForm] = useState({
    purchaseType: "true",
    status: "Activo",
    companyName: "",
  });

  const buildCodesPatchPayload = (fields, form) => {
    const payload = {};
    if (fields.purchaseType) payload.purchaseType = String(form.purchaseType) === "true";
    if (fields.status) payload.status = String(form.status || "").trim() || "Activo";
    if (fields.companyName) payload.companyName = String(form.companyName || "").trim();
    return payload;
  };

  const syncCodesPatchPayload = (nextFields, nextForm) => {
    const payload = buildCodesPatchPayload(nextFields, nextForm);
    onPayloadChange(JSON.stringify(payload, null, 2));
  };

  const onCodesEditFieldToggle = (field, checked) => {
    const nextFields = { ...codesEditFields, [field]: checked };
    setCodesEditFields(nextFields);
    syncCodesPatchPayload(nextFields, codesEditForm);
  };

  const onCodesEditFormChange = (field, value) => {
    const nextForm = { ...codesEditForm, [field]: value };
    setCodesEditForm(nextForm);
    syncCodesPatchPayload(codesEditFields, nextForm);
  };

  const applyPageChange = (nextPage) => {
    const target = Math.min(Math.max(nextPage, 1), totalPages);
    setPageInput(String(target));
    onPageChange(target);
  };

  const handleGoToPage = () => {
    const parsed = Number.parseInt(String(pageInput || "").trim(), 10);
    if (!Number.isFinite(parsed)) return;
    applyPageChange(parsed);
  };

  const endpointItems = [
    ["GET LIST", endpointTemplates.list],
    ["GET ID", endpointTemplates.getById],
    ["POST", endpointTemplates.create],
    ["PATCH", endpointTemplates.update],
    ["DELETE", endpointTemplates.remove],
    ["BULK", endpointTemplates.bulkDelete],
  ];

  const listColumns = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        cellClassName: "w-52",
        render: (item) => (
          <div className="space-y-2">
            <div className="mono break-all text-xs text-[var(--on-surface-variant)]">
              {item?.__hasRealId ? item.__rowId : "sin-id"}
            </div>
            {!item?.__hasRealId ? <StatusBadge status="warning">Temporal</StatusBadge> : null}
          </div>
        ),
      },
      {
        key: "summary",
        header: "Resumen",
        render: (item) => (
          <div className="space-y-3">
            {moduleSummaryFields.length > 0 ? (
              <div className="grid gap-2 md:grid-cols-2">
                {moduleSummaryFields.map((summaryField) => (
                  <div key={summaryField.key} className="rounded-2xl bg-[var(--surface-low)] px-3 py-2">
                    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--on-surface-variant)]">
                      {summaryField.label}
                    </div>
                    <div className="mt-1 text-sm text-[var(--on-surface)]">{item?.[summaryField.key] || "-"}</div>
                  </div>
                ))}
              </div>
            ) : null}
            <pre className="mono overflow-auto rounded-2xl bg-[var(--surface-low)] p-3 text-xs text-[var(--on-surface)]">
              {JSON.stringify(item, null, 2)}
            </pre>
          </div>
        ),
      },
    ],
    [moduleSummaryFields]
  );

  return (
    <div className="flex flex-col gap-6" aria-busy={loading}>
      <SurfacePanel className="p-6">
        <ModuleToolbar
          title={moduleDefinition.label}
          description={moduleDefinition.description}
          meta={
            <>
              <StatusBadge status="info">Total: {listTotal}</StatusBadge>
              <StatusBadge>{modulePayloadMode}</StatusBadge>
              {selectedIds.length > 0 ? <StatusBadge status="warning">Seleccionados: {selectedIds.length}</StatusBadge> : null}
            </>
          }
          actions={
            <>
              <button
                type="button"
                onClick={() => {
                  onRequestIdChange("");
                  onRun("GET_LIST");
                }}
                disabled={loading}
                className="app-button app-button-secondary px-4 py-2.5 text-sm"
              >
                <ListChecks className="h-4 w-4" />
                Listar
              </button>
              <button
                type="button"
                onClick={onRunBulkDelete}
                disabled={loading || selectedIds.length === 0}
                className="app-button app-button-danger px-4 py-2.5 text-sm"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar seleccionados
              </button>
            </>
          }
        />

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {endpointItems.map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-[var(--surface-low)] px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">{label}</div>
              <div className="mono mt-2 break-all text-xs text-[var(--on-surface)]">{value || "-"}</div>
            </div>
          ))}
        </div>
      </SurfacePanel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
        <div className="space-y-6">
          <FormSection
            title="Consulta y acciones"
            description="La logica de operaciones se mantiene intacta; aqui solo cambia la capa visual del flujo CRUD."
          >
            <div className="grid gap-5">
              <FormField label="ID del registro" htmlFor={`crud-id-${moduleDefinition.key}`} helper="Se usa para GET por ID, PATCH y DELETE.">
                <SearchField
                  id={`crud-id-${moduleDefinition.key}`}
                  value={requestId}
                  onChange={(event) => onRequestIdChange(event.target.value)}
                  placeholder="Ej: 698e622a7c856cb8ebbcf802"
                />
              </FormField>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <button type="button" onClick={() => onRun("GET")} disabled={loading || !requestId.trim()} className="app-button app-button-secondary px-4 py-2.5 text-sm">
                  <Eye className="h-4 w-4" />
                  Consultar ID
                </button>
                {!isCodesModule ? (
                  <button type="button" onClick={() => onRun("POST")} disabled={loading} className="app-button app-button-primary px-4 py-2.5 text-sm">
                    <Plus className="h-4 w-4" />
                    Crear
                  </button>
                ) : null}
                <button type="button" onClick={() => onRun("PATCH")} disabled={loading} className="app-button app-button-secondary px-4 py-2.5 text-sm">
                  <RefreshCcw className="h-4 w-4" />
                  Actualizar
                </button>
                <button type="button" onClick={() => onRun("DELETE")} disabled={loading} className="app-button app-button-danger px-4 py-2.5 text-sm">
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </FormSection>

          {!isCodesModule && moduleFormConfig ? (
            <FormSection
              title={moduleFormConfig.title}
              description="Formulario dinamico basado en metadata remota del backend."
              actions={
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--on-surface-variant)]">Modo</span>
                  <select
                    id={`crud-mode-${moduleDefinition.key}`}
                    className="app-input min-w-40"
                    value={modulePayloadMode}
                    onChange={(event) => onModulePayloadModeChange(event.target.value)}
                  >
                    <option value="CREATE">CREATE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
              }
            >
              <div className="grid gap-5 md:grid-cols-2">
                {(moduleFormConfig.fields || []).map((field) => (
                  <FormField key={field.key} label={field.label} htmlFor={`${moduleDefinition.key}-${field.key}`}>
                    <>
                      {modulePayloadMode === "PATCH" ? (
                        <label className="mb-1 inline-flex items-center gap-2 text-xs text-[var(--on-surface-variant)]">
                          <input
                            type="checkbox"
                            checked={Boolean(modulePatchFields?.[field.key])}
                            onChange={(event) => onModulePatchFieldToggle(field.key, event.target.checked)}
                            aria-label={`Incluir campo ${field.label} en PATCH`}
                          />
                          Incluir en PATCH
                        </label>
                      ) : null}
                      {field.type === "select" ? (
                        <select
                          id={`${moduleDefinition.key}-${field.key}`}
                          className="app-input"
                          value={moduleFormData?.[field.key] || ""}
                          onChange={(event) => onModuleFormFieldChange(field.key, event.target.value)}
                        >
                          {resolveFieldOptions(field).map((optionValue) => (
                            <option key={optionValue} value={optionValue}>
                              {optionValue}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={`${moduleDefinition.key}-${field.key}`}
                          className="app-input"
                          type={field.type || "text"}
                          value={moduleFormData?.[field.key] || ""}
                          onChange={(event) => onModuleFormFieldChange(field.key, event.target.value)}
                          placeholder={field.key}
                        />
                      )}
                    </>
                  </FormField>
                ))}
              </div>
              <p className="mt-4 text-xs text-[var(--on-surface-variant)]">
                En modo PATCH solo se enviaran los campos marcados como editables.
              </p>
            </FormSection>
          ) : null}

          {isCodesModule ? (
            <FormSection title="Edicion rapida de codigos" description="Herramientas especializadas de QR y tarjetas sin cambiar la logica existente.">
              <div className="grid gap-5 md:grid-cols-3">
                <FormField label="purchaseType">
                  <>
                    <label className="mb-1 inline-flex items-center gap-2 text-xs text-[var(--on-surface-variant)]">
                      <input
                        type="checkbox"
                        checked={codesEditFields.purchaseType}
                        onChange={(event) => onCodesEditFieldToggle("purchaseType", event.target.checked)}
                      />
                      Incluir
                    </label>
                    <select
                      className="app-input"
                      value={codesEditForm.purchaseType}
                      onChange={(event) => onCodesEditFormChange("purchaseType", event.target.value)}
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  </>
                </FormField>

                <FormField label="status">
                  <>
                    <label className="mb-1 inline-flex items-center gap-2 text-xs text-[var(--on-surface-variant)]">
                      <input
                        type="checkbox"
                        checked={codesEditFields.status}
                        onChange={(event) => onCodesEditFieldToggle("status", event.target.checked)}
                      />
                      Incluir
                    </label>
                    <select className="app-input" value={codesEditForm.status} onChange={(event) => onCodesEditFormChange("status", event.target.value)}>
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </>
                </FormField>

                <FormField label="companyName">
                  <>
                    <label className="mb-1 inline-flex items-center gap-2 text-xs text-[var(--on-surface-variant)]">
                      <input
                        type="checkbox"
                        checked={codesEditFields.companyName}
                        onChange={(event) => onCodesEditFieldToggle("companyName", event.target.checked)}
                      />
                      Incluir
                    </label>
                    <input
                      className="app-input"
                      type="text"
                      value={codesEditForm.companyName}
                      onChange={(event) => onCodesEditFormChange("companyName", event.target.value)}
                      placeholder="Empresa"
                    />
                  </>
                </FormField>
              </div>

              <FormActions>
                <button type="button" onClick={() => onRun("GET")} disabled={loading || !requestId.trim()} className="app-button app-button-secondary px-4 py-2.5 text-sm">
                  Consultar por ID
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onModulePayloadModeChange("PATCH");
                    onRun("PATCH");
                  }}
                  disabled={loading || !requestId.trim() || Object.values(codesEditFields).every((enabled) => !enabled)}
                  className="app-button app-button-primary px-4 py-2.5 text-sm"
                >
                  Guardar cambios
                </button>
                <button type="button" onClick={() => onRun("DELETE")} disabled={loading || !requestId.trim()} className="app-button app-button-danger px-4 py-2.5 text-sm">
                  Eliminar por ID
                </button>
              </FormActions>
            </FormSection>
          ) : null}

          {codesTools?.enabled ? (
            <FormSection title="Generacion y validacion QR" description="Acciones especializadas para codigos, PDF y validacion operativa.">
              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Cantidad de codigos (numCodes)">
                  <input
                    className="app-input"
                    type="number"
                    min={1}
                    value={codesTools.qrBatchForm?.numCodes || ""}
                    onChange={(event) => codesTools.setQrBatchField("numCodes", event.target.value)}
                    placeholder="Ejemplo: 50"
                  />
                </FormField>
                <FormField label="purchaseType">
                  <select
                    className="app-input"
                    value={String(codesTools.qrBatchForm?.purchaseType || "true")}
                    onChange={(event) => codesTools.setQrBatchField("purchaseType", event.target.value)}
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                </FormField>
                <FormField label="Empresa (opcional)">
                  <input
                    className="app-input"
                    type="text"
                    value={codesTools.qrBatchForm?.companyName || ""}
                    onChange={(event) => codesTools.setQrBatchField("companyName", event.target.value)}
                    placeholder="Ejemplo: Acme SA"
                  />
                </FormField>
                <div className="rounded-2xl bg-[var(--surface-low)] p-4 text-sm text-[var(--on-surface-variant)]">
                  <div className="font-semibold text-[var(--on-surface)]">Campos automaticos</div>
                  <ul className="mt-2 space-y-1">
                    <li>status: Activo</li>
                    <li>order y orderNumber: automaticos</li>
                    <li>randomCode y secretCode: automaticos</li>
                  </ul>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {codesTools.canGenerateCodes ? (
                  <>
                    <button
                      type="button"
                      className="app-button app-button-primary px-4 py-2.5 text-sm"
                      onClick={codesTools.runGenerateQrBatchAndPdf}
                      disabled={codesTools.loading || !codesTools.endpoints?.generateQr || !codesTools.endpoints?.generatePdf}
                    >
                      <Download className="h-4 w-4" />
                      Generar y descargar PDF
                    </button>
                    <button
                      type="button"
                      className="app-button app-button-secondary px-4 py-2.5 text-sm"
                      onClick={codesTools.runGenerateQrBatch}
                      disabled={codesTools.loading || !codesTools.endpoints?.generateQr}
                    >
                      Solo generar lote
                    </button>
                    <button
                      type="button"
                      className="app-button app-button-secondary px-4 py-2.5 text-sm"
                      onClick={codesTools.runGeneratePdf}
                      disabled={codesTools.loading || !codesTools.endpoints?.generatePdf}
                    >
                      <FileText className="h-4 w-4" />
                      Solo descargar PDF
                    </button>
                  </>
                ) : (
                  <PermissionHint>La generacion de codigos esta oculta por permisos de create.</PermissionHint>
                )}
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <input
                  className="app-input"
                  type="text"
                  placeholder="ID de tarjeta para validar"
                  value={codesTools.cardValidationId || ""}
                  onChange={(event) => codesTools.setCardValidationId(event.target.value)}
                />
                <button
                  type="button"
                  className="app-button app-button-secondary px-4 py-2.5 text-sm"
                  onClick={codesTools.runValidateCard}
                  disabled={codesTools.loading || !codesTools.canValidateCards || !codesTools.endpoints?.validateCard}
                >
                  <KeyRound className="h-4 w-4" />
                  Validar tarjeta
                </button>
              </div>

              {codesTools.cardValidationResult ? (
                <div className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${codesTools.cardValidationResult.ok ? "status-ok" : "status-error"}`}>
                  {codesTools.cardValidationResult.message}
                </div>
              ) : null}
            </FormSection>
          ) : null}
        </div>

        <div className="space-y-6">
          {!isCodesModule ? (
            <FormSection title="Payload JSON" description="Editor libre para POST y PATCH.">
              <textarea className="app-input mono min-h-64" value={payloadText} onChange={(event) => onPayloadChange(event.target.value)} />
            </FormSection>
          ) : null}

          <SurfacePanel className="p-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="app-section-label">Resultados</p>
                <h3 className="mt-1 text-lg font-semibold text-[var(--on-surface)]">Lista actual</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
                  <input
                    type="checkbox"
                    checked={
                      listItems.length > 0 &&
                      listItems.every((item) => selectedIds.includes(String(item?.__rowId || item?.id || item?._id || "")))
                    }
                    onChange={(event) => onSetSelectAll(event.target.checked)}
                    disabled={loading || listItems.length === 0}
                  />
                  Seleccionar pagina
                </label>
              </div>
            </div>

            <NoticeBanner notice={notice} />
            {bulkSummary ? <div className="status-ok mt-4 rounded-2xl px-4 py-3 text-sm font-medium">{bulkSummary}</div> : null}
            {error && !notice?.message ? <ErrorState className="mt-4 p-4" message={error} /> : null}

            <div className="mt-4">
              {listItems.length > 0 ? (
                <DataTable
                  columns={listColumns}
                  rows={listItems}
                  getRowId={(item) => item?.__rowId || item?.id || item?._id || JSON.stringify(item)}
                  selectable
                  selectedIds={selectedIds}
                  onToggleRow={onToggleSelectedId}
                  onToggleAll={onSetSelectAll}
                  loading={loading}
                  emptyTitle="Sin registros"
                  emptyDescription="Ejecuta GET para cargar registros y habilitar seleccion multiple."
                />
              ) : (
                <EmptyState
                  title="Sin registros cargados"
                  description="Ejecuta GET para consultar datos del modulo actual y mostrar resultados en la tabla."
                />
              )}
            </div>

            {totalPages > 1 ? (
              <div className="mt-4 flex flex-col gap-3 border-t border-[var(--ghost-border)] pt-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-[var(--on-surface-variant)]">
                  Pagina <span className="font-semibold text-[var(--on-surface)]">{currentPage}</span> de{" "}
                  <span className="font-semibold text-[var(--on-surface)]">{totalPages}</span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    id={`goto-page-${moduleDefinition.key}`}
                    className="app-input h-11 w-24"
                    type="number"
                    min={1}
                    max={totalPages}
                    value={pageInput || String(currentPage || 1)}
                    onChange={(event) => setPageInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleGoToPage();
                      }
                    }}
                  />
                  <button type="button" className="app-button app-button-secondary px-4 py-2.5 text-sm" onClick={handleGoToPage} disabled={loading}>
                    Ir
                  </button>
                </div>
              </div>
            ) : null}
          </SurfacePanel>
        </div>
      </div>
    </div>
  );
};

