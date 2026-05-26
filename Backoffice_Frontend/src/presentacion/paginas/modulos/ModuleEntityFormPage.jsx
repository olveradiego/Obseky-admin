﻿import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useModuleCrud } from "@/presentacion/ganchos/useModuleCrud";
import { useCompanyFilter } from "@/presentacion/ganchos/useCompanyFilter";
import { useSession } from "@/presentacion/ganchos/useSession";
import { getFieldLabel, humanizeFieldLabel } from "@/dominio/constantes/fieldLabels";
import { PERMISSION_MODULE_BY_UI_MODULE } from "@/dominio/constantes/permissions";
import { canRunModuleMethod } from "@/dominio/servicios/permissionService";
import { PageContainer } from "@/presentacion/componentes/interfaz/PageContainer";
import { PageHeader } from "@/presentacion/componentes/interfaz/PageHeader";
import { ErrorState } from "@/presentacion/componentes/interfaz/ErrorState";
import { EmptyState } from "@/presentacion/componentes/interfaz/EmptyState";
import { FormSection } from "@/presentacion/componentes/interfaz/FormSection";
import { FormField } from "@/presentacion/componentes/interfaz/FormField";
import { FormActions } from "@/presentacion/componentes/interfaz/FormActions";
import { PrimaryButton } from "@/presentacion/componentes/interfaz/PrimaryButton";
import { SecondaryButton } from "@/presentacion/componentes/interfaz/SecondaryButton";
import { LoadingSkeleton } from "@/presentacion/componentes/interfaz/LoadingSkeleton";

const humanize = (value) => humanizeFieldLabel(value);

const toOptionLabel = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "pending") return "Pendiente";
  if (normalized === "paid") return "Pagado";
  if (normalized === "active") return "Activo";
  if (normalized === "inactive") return "Inactivo";
  if (normalized === "mxn") return "Peso mexicano (MXN)";
  if (normalized === "ars") return "Peso argentino (ARS)";
  if (normalized === "cop") return "Peso colombiano (COP)";
  if (normalized === "ves") return "Bolivar venezolano (VES)";
  return humanize(value);
};

const resolveInputType = (fieldKey, fieldType) => {
  if (fieldType === "number") return "number";
  if (fieldType === "email") return "email";
  if (fieldType === "date") return "date";
  if (fieldType === "password") return "password";
  const lowerKey = String(fieldKey || "").toLowerCase();
  if (lowerKey.includes("email")) return "email";
  if (lowerKey.includes("password")) return "password";
  if (lowerKey.includes("date")) return "date";
  return "text";
};

const shouldUseTextarea = (fieldKey) => /description|address|notes|comment/i.test(String(fieldKey || ""));
const isCompanyField = (fieldKey) => ["companyid", "company", "companyname"].includes(String(fieldKey || "").toLowerCase());
const isCurrencyField = (fieldKey) => String(fieldKey || "").toLowerCase() === "currency";
const isStatusField = (fieldKey) => ["status", "estado", "isactive", "state"].includes(String(fieldKey || "").toLowerCase());

export const ModuleEntityFormPage = ({ moduleKey, mode = "create" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [fieldErrors, setFieldErrors] = useState({});
  const { apiBase, token, profile, metaConfig, logout } = useSession();
  const { companyOptions } = useCompanyFilter();
  const crud = useModuleCrud({
    apiBase,
    moduleName: moduleKey,
    token,
    permissions: profile?.permissions,
    role: profile?.admin?.role,
    metaConfig,
    onUnauthorized: logout,
  });

  const isEditMode = mode === "edit";
  const entityId = params.id || "";
  const permissionModuleName = PERMISSION_MODULE_BY_UI_MODULE[moduleKey] || moduleKey;
  const canSubmit = canRunModuleMethod({
    role: profile?.admin?.role,
    permissions: profile?.permissions,
    permissionsMatrix: metaConfig?.permissionsMatrix,
    moduleKey: permissionModuleName,
    method: isEditMode ? "PATCH" : "POST",
  });

  const handleGoBack = () => {
    if (location.pathname.startsWith("/finanzas/")) {
      navigate("/finanzas", {
        replace: true,
        state: { financeTab: moduleKey === "orders" ? "orders" : moduleKey === "expenses" ? "expenses" : undefined },
      });
      return;
    }

    navigate(`/modules/${moduleKey}`, { replace: true });
  };

  useEffect(() => {
    if (isEditMode && entityId) {
      crud.run("GET", { id: entityId });
      return;
    }
    crud.resetForm("CREATE");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, isEditMode, moduleKey]);

  const title = isEditMode ? `Editar ${crud.moduleDefinition.label}` : `Crear ${crud.moduleDefinition.label}`;
  const description = isEditMode
    ? "Actualiza el registro usando los campos disponibles en metadata."
    : "Completa el formulario dinamico para crear un nuevo registro.";

  const validationErrors = useMemo(() => {
    const nextErrors = {};
    for (const field of crud.mutableFields) {
      if (!field.required) continue;
      const value = crud.moduleFormData?.[field.key];
      if (value === "" || value === null || value === undefined) {
        nextErrors[field.key] = "Este campo es obligatorio.";
      }
    }
    return nextErrors;
  }, [crud.moduleFormData, crud.mutableFields]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const result = await crud.run(isEditMode ? "PATCH" : "POST", {
      id: isEditMode ? entityId : "",
    });

    if (result?.ok) {
      handleGoBack();
    }
  };

  const formFields = crud.moduleFormConfig?.fields || [];

  if (isEditMode && crud.loading && !crud.moduleFormConfig) {
    return <LoadingSkeleton variant="panel" />;
  }

  if (!formFields.length && !crud.loading) {
    return (
      <PageContainer>
        <EmptyState
          title="No hay metadata de formulario"
          description="Este modulo no expone campos editables desde backend, por lo que no es posible renderizar el formulario."
          action={
            <SecondaryButton type="button" onClick={handleGoBack}>
              Volver al listado
            </SecondaryButton>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Formulario dinamico"
        title={title}
        description={description}
        actions={
          <SecondaryButton type="button" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </SecondaryButton>
        }
      />

      {crud.error ? <ErrorState title="No fue posible preparar el formulario" message={crud.error} /> : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection
          title="Campos del registro"
          description="Los controles se generan usando metadata del backend y respetan el contrato del modulo."
        >
          <div className="grid gap-5 md:grid-cols-2">
            {formFields.map((field) => {
              const fieldValue = crud.moduleFormData?.[field.key] ?? "";
              const error = fieldErrors[field.key];
              const commonProps = {
                id: field.key,
                value: fieldValue,
                disabled: !canSubmit || crud.loading,
                onChange: (event) => {
                  const nextValue = event.target.value;
                  setFieldErrors((previous) => ({ ...previous, [field.key]: "" }));
                  crud.onModuleFormFieldChange(field.key, nextValue);
                },
              };

              return (
                <FormField
                  key={field.key}
                  label={getFieldLabel(field)}
                  htmlFor={field.key}
                  error={error}
                  helper={
                    isCompanyField(field.key)
                      ? "Se muestra el nombre de la compania y se mantiene companyId como valor interno."
                      : isCurrencyField(field.key)
                        ? "Selecciona la moneda del gasto. Por defecto se usa peso mexicano (MXN)."
                      : isStatusField(field.key)
                        ? "Selecciona el estado."
                      : field.type === "select"
                        ? "Selecciona una opcion valida."
                        : ""
                  }
                >
                  {isCompanyField(field.key) ? (
                    <select className="app-input" {...commonProps}>
                      <option value="">Selecciona una compania</option>
                      {companyOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : isStatusField(field.key) ? (
                    <select className="app-input" {...commonProps}>
                      <option value="">Selecciona un estado...</option>
                      <option value="Active">Activo</option>
                      <option value="Inactive">Inactivo</option>
                    </select>
                  ) : field.type === "select" ? (
                    <select className="app-input" {...commonProps}>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {toOptionLabel(option)}
                        </option>
                      ))}
                    </select>
                  ) : shouldUseTextarea(field.key) ? (
                    <textarea className="app-input min-h-32 resize-y" {...commonProps} />
                  ) : (
                    <input
                      className="app-input"
                      type={resolveInputType(field.key, field.type)}
                      step={field.type === "number" ? "any" : undefined}
                      {...commonProps}
                    />
                  )}
                </FormField>
              );
            })}
          </div>
        </FormSection>

        <FormActions>
          <SecondaryButton type="button" onClick={handleGoBack} disabled={crud.loading}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={!canSubmit || crud.loading}>
            <Save className="h-4 w-4" />
            {isEditMode ? "Guardar cambios" : "Crear registro"}
          </PrimaryButton>
        </FormActions>
      </form>
    </PageContainer>
  );
};
