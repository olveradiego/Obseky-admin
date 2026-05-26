import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  RefreshCw,
} from "lucide-react";
import { useModuleCrud } from "@/presentacion/ganchos/useModuleCrud";
import { useCompanyFilter } from "@/presentacion/ganchos/useCompanyFilter";
import { useSession } from "@/presentacion/ganchos/useSession";
import { PERMISSION_MODULE_BY_UI_MODULE } from "@/dominio/constantes/permissions";
import { getFieldLabel, humanizeFieldLabel } from "@/dominio/constantes/fieldLabels";
import { canRunModuleMethod } from "@/dominio/servicios/permissionService";
import { PageContainer } from "@/presentacion/componentes/interfaz/PageContainer";
import { ModuleHeader } from "@/presentacion/componentes/interfaz/ModuleHeader";
import { FilterBar } from "@/presentacion/componentes/interfaz/FilterBar";
import { SearchInput } from "@/presentacion/componentes/interfaz/SearchInput";
import { SecondaryButton } from "@/presentacion/componentes/interfaz/SecondaryButton";
import { DataTable } from "@/presentacion/componentes/interfaz/DataTable";
import { TableRowActions } from "@/presentacion/componentes/interfaz/TableRowActions";
import { StatusBadge } from "@/presentacion/componentes/interfaz/StatusBadge";
import { ErrorState } from "@/presentacion/componentes/interfaz/ErrorState";

const HIDDEN_FIELD_KEYS = new Set(["password", "__v"]);
const humanize = (value) => humanizeFieldLabel(value);
const PRIORITY_FIELDS_BY_MODULE = {
  orders: ["companyId", "orderNumber", "cardQuantity", "unitPrice", "totalAmount", "paymentStatus"],
};

const getFieldHeaderLabel = (field) => getFieldLabel(field);

const toDisplayLabel = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "pending") return "Pendiente";
  if (normalized === "paid") return "Pagado";
  if (normalized === "active") return "Activo";
  if (normalized === "inactive") return "Inactivo";
  if (normalized === "cancelled") return "Cancelado";
  if (normalized === "global") return "Global";
  return humanize(value);
};

const isTruthyStatus = (value) => ["active", "activo", "paid", "pagado", "true"].includes(String(value).toLowerCase());
const isFalsyStatus = (value) => ["inactive", "inactivo", "pending", "cancelled", "false"].includes(String(value).toLowerCase());

const formatCompanyValue = ({ row, getCompanyNameById }) => {
  const companyId = row?.companyId || row?.company?._id || row?.company?.id || "";
  const nestedName = row?.company?.name || row?.company?.companyName || row?.companyName || "";
  const resolvedName = nestedName || getCompanyNameById(companyId, "");

  if (!resolvedName && !companyId) {
    return <span className="text-[var(--on-surface-variant)]">-</span>;
  }

  return (
    <div className="min-w-0">
      <div className="truncate font-medium">{resolvedName || companyId}</div>
      {companyId && resolvedName ? <div className="mono text-xs text-[var(--on-surface-variant)]">{companyId}</div> : null}
    </div>
  );
};

const formatValue = (value, key, row, getCompanyNameById) => {
  if (value === null || value === undefined || value === "") {
    if (String(key || "").toLowerCase() === "companyid") {
      return formatCompanyValue({ row, getCompanyNameById });
    }
    return <span className="text-[var(--on-surface-variant)]">-</span>;
  }

  if (typeof value === "boolean") {
    return <StatusBadge status={value ? "success" : "warning"}>{value ? "Si" : "No"}</StatusBadge>;
  }

  if (typeof value === "number") {
    return <span className="font-medium">{value}</span>;
  }

  if (typeof value === "string") {
    if (String(key || "").toLowerCase() === "companyid") {
      return formatCompanyValue({ row, getCompanyNameById });
    }

    const normalized = value.trim();
    const lowerValue = normalized.toLowerCase();
    const lowerKey = String(key || "").toLowerCase();

    if (lowerKey.includes("date") || lowerKey.endsWith("at")) {
      const parsed = Date.parse(normalized);
      if (!Number.isNaN(parsed)) {
        return new Date(parsed).toLocaleString();
      }
    }

    if (isTruthyStatus(lowerValue)) {
      return <StatusBadge status="success">{toDisplayLabel(normalized)}</StatusBadge>;
    }

    if (isFalsyStatus(lowerValue)) {
      return <StatusBadge status="warning">{toDisplayLabel(normalized)}</StatusBadge>;
    }

    return toDisplayLabel(normalized);
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "-";
  }

  if (typeof value === "object") {
    const labelCandidate = value.name || value.label || value.title || value.id || value._id;
    return labelCandidate ? String(labelCandidate) : JSON.stringify(value);
  }

  return String(value);
};

const matchesSearch = (row, searchTerm) => {
  if (!searchTerm) return true;
  const lowerSearch = searchTerm.toLowerCase();
  return Object.values(row || {}).some((value) => JSON.stringify(value || "").toLowerCase().includes(lowerSearch));
};

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--ghost-border)] bg-white/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--on-surface-variant)]">
        Pagina {currentPage} de {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <SecondaryButton type="button" onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage <= 1}>
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </SecondaryButton>
        <SecondaryButton
          type="button"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage >= totalPages}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </SecondaryButton>
      </div>
    </div>
  );
};

export const ModuleCrudPage = ({ moduleKey }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { apiBase, token, profile, metaConfig, logout } = useSession();
  const { getCompanyNameById } = useCompanyFilter();
  const crud = useModuleCrud({
    apiBase,
    moduleName: moduleKey,
    token,
    permissions: profile?.permissions,
    role: profile?.admin?.role,
    metaConfig,
    onUnauthorized: logout,
  });

  useEffect(() => {
    crud.run("GET_LIST");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleKey]);

  const permissionModuleName = PERMISSION_MODULE_BY_UI_MODULE[moduleKey] || moduleKey;
  const canCreate = canRunModuleMethod({
    role: profile?.admin?.role,
    permissions: profile?.permissions,
    permissionsMatrix: metaConfig?.permissionsMatrix,
    moduleKey: permissionModuleName,
    method: "POST",
  });
  const canEdit = canRunModuleMethod({
    role: profile?.admin?.role,
    permissions: profile?.permissions,
    permissionsMatrix: metaConfig?.permissionsMatrix,
    moduleKey: permissionModuleName,
    method: "PATCH",
  });
  const canDelete = canRunModuleMethod({
    role: profile?.admin?.role,
    permissions: profile?.permissions,
    permissionsMatrix: metaConfig?.permissionsMatrix,
    moduleKey: permissionModuleName,
    method: "DELETE",
  });

  const visibleFields = useMemo(() => {
    const sourceFields = [...(crud.moduleFields?.filter((field) => field?.key && !HIDDEN_FIELD_KEYS.has(field.key)) || [])];
    const firstRow = crud.allListItems[0] || {};
    const hasCompanyColumn = sourceFields.some((field) => ["companyid", "companyname"].includes(String(field.key).toLowerCase()));
    const rowHasCompanyData = Boolean(firstRow.companyId || firstRow.companyName || firstRow.company);

    if (!hasCompanyColumn && rowHasCompanyData) {
      sourceFields.push({ key: "companyId", type: "string" });
    }

    if (sourceFields.length === 0) {
      return Object.keys(firstRow)
        .filter((key) => !key.startsWith("__") && !HIDDEN_FIELD_KEYS.has(key))
        .slice(0, 5)
        .map((key) => ({ key, type: typeof firstRow[key] }));
    }

    const priorityKeys = PRIORITY_FIELDS_BY_MODULE[moduleKey] || [];
    if (priorityKeys.length === 0) {
      return sourceFields.slice(0, 5);
    }

    const fieldByKey = new Map(
      sourceFields.map((field) => [String(field.key || "").trim().toLowerCase(), field])
    );
    const prioritizedFields = priorityKeys
      .map((key) => fieldByKey.get(String(key).trim().toLowerCase()))
      .filter(Boolean);
    const prioritizedKeys = new Set(prioritizedFields.map((field) => String(field.key || "").trim().toLowerCase()));
    const remainingFields = sourceFields.filter((field) => !prioritizedKeys.has(String(field.key || "").trim().toLowerCase()));

    return [...prioritizedFields, ...remainingFields].slice(0, 6);
  }, [crud.allListItems, crud.moduleFields, moduleKey]);

  const filteredItems = useMemo(
    () => crud.allListItems.filter((row) => matchesSearch(row, searchTerm)),
    [crud.allListItems, searchTerm]
  );

  const paginatedFilteredItems = useMemo(() => {
    const startIndex = (crud.currentPage - 1) * crud.pageSize;
    return filteredItems.slice(startIndex, startIndex + crud.pageSize);
  }, [crud.currentPage, crud.pageSize, filteredItems]);

  const filteredTotalPages = Math.max(1, Math.ceil(filteredItems.length / crud.pageSize));

  useEffect(() => {
    if (crud.currentPage > filteredTotalPages) {
      crud.setCurrentPage(1);
    }
  }, [crud, crud.currentPage, crud.setCurrentPage, filteredTotalPages]);

  const isFinanceContext = location.pathname.startsWith("/finanzas");
  const financeTab = moduleKey === "orders" ? "orders" : moduleKey === "expenses" ? "expenses" : undefined;
  const resolveCreatePath = () =>
    isFinanceContext && financeTab ? `/finanzas/${moduleKey}/create` : `/modules/${moduleKey}/create`;

  const columns = useMemo(() => {
    const dynamicColumns = visibleFields.map((field) => ({
      key: field.key,
      header: getFieldHeaderLabel(field),
      render: (row) => formatValue(row?.[field.key], field.key, row, getCompanyNameById),
    }));

    return [
      ...dynamicColumns,
      {
        key: "__actions",
        header: "Acciones",
        headerClassName: "text-right",
        cellClassName: "w-40",
        render: (row) => (
          <TableRowActions
            row={row}
            onEdit={(item) =>
              navigate(
                isFinanceContext && financeTab
                  ? `/finanzas/${moduleKey}/${crud.resolveItemId(item)}/edit`
                  : `/modules/${moduleKey}/${crud.resolveItemId(item)}/edit`
              )
            }
            onDelete={async (item) => {
              const itemId = crud.resolveItemId(item);
              const itemName = visibleFields
                .map((field) => item?.[field.key])
                .find((value) => typeof value === "string" && value.trim());
              const confirmationMessage = itemName
                ? `Se eliminara "${itemName}". Deseas continuar?`
                : "Se eliminara el registro seleccionado. Deseas continuar?";
              await crud.run("DELETE", { id: itemId, confirmMessage: confirmationMessage });
            }}
            canEdit={canEdit}
            canDelete={canDelete}
            editLabel="Editar"
            deleteLabel="Eliminar"
          />
        ),
      },
    ];
  }, [canDelete, canEdit, crud, financeTab, getCompanyNameById, isFinanceContext, moduleKey, navigate, visibleFields]);

  return (
    <PageContainer>
      <ModuleHeader
        title={crud.moduleDefinition.label}
        description={crud.moduleDefinition.description}
        count={filteredItems.length || crud.listTotal}
        onCreate={() => navigate(resolveCreatePath())}
        canCreate={canCreate}
        createDisabledReason="No tienes permisos para crear en este modulo."
        actions={
          <SecondaryButton type="button" onClick={() => crud.run("GET_LIST")} disabled={crud.loading}>
            <RefreshCw className="h-4 w-4" />
            Recargar
          </SecondaryButton>
        }
      />

      <FilterBar>
        <div className="xl:col-span-7">
          <SearchInput value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        </div>
        <div className="xl:col-span-5 flex flex-wrap items-center justify-end gap-2">
          <StatusBadge status={crud.operationState.kind}>
            {humanize(crud.operationState.kind)}: {crud.operationState.title}
          </StatusBadge>
          <StatusBadge status="info">{filteredItems.length} visibles</StatusBadge>
        </div>
      </FilterBar>

      {crud.error ? (
        <ErrorState
          title="No fue posible cargar el modulo"
          message={crud.error}
          action={
            <SecondaryButton type="button" onClick={() => crud.run("GET_LIST")}>
              Reintentar
            </SecondaryButton>
          }
        />
      ) : null}

      {crud.notice?.message ? (
        <div className="rounded-2xl border border-[var(--ghost-border)] bg-white/80 px-4 py-3 text-sm text-[var(--on-surface)]">
          <div className="flex items-center gap-2">
            {crud.notice.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : crud.notice.type === "error" || crud.notice.type === "forbidden" ? (
              <AlertCircle className="h-4 w-4 text-[var(--error)]" />
            ) : (
              <Circle className="h-4 w-4 text-[var(--on-surface-variant)]" />
            )}
            <span>{crud.notice.message}</span>
          </div>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        rows={paginatedFilteredItems}
        getRowId={crud.resolveItemId}
        loading={crud.loading}
        emptyTitle="No hay registros para mostrar"
        emptyDescription={searchTerm ? "Ajusta la busqueda o crea un registro nuevo." : "Este modulo aun no tiene registros."}
        emptyAction={
          canCreate ? (
            <SecondaryButton
              type="button"
              onClick={() =>
                navigate(resolveCreatePath())
              }
            >
              Crear primer registro
            </SecondaryButton>
          ) : null
        }
      />

      <PaginationControls
        currentPage={crud.currentPage}
        totalPages={Math.max(filteredTotalPages, 1)}
        onPageChange={crud.setCurrentPage}
      />
    </PageContainer>
  );
};


