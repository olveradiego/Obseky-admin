import React from "react";
import { DateFilter } from "../compartido/DateFilter";

/**
 * @filePurpose OrderFilters.jsx
 * @description Componente de filtros para la pÃ¡gina de Ã“rdenes de Venta.
 */
export const OrderFilters = ({
  companies,
  filters,
  onFilterChange,
  onClearFilters,
  loading,
}) => {
  return (
    <div className="panel-frame rounded-xl p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Filter by Payment Status */}
        <div>
          <label htmlFor="paymentStatus" className="field-label">
            Estado de Pago
          </label>
          <select
            id="paymentStatus"
            className="input-core"
            value={filters.paymentStatus || ""}
            onChange={(e) => onFilterChange("paymentStatus", e.target.value)}
            disabled={loading}
          >
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="paid">Pagado</option>
          </select>
        </div>

        {/* Filter by Company */}
        <div>
          <label htmlFor="companyId" className="field-label">
            CompaÃ±Ã­a
          </label>
          <select
            id="companyId"
            className="input-core"
            value={filters.companyId || ""}
            onChange={(e) => onFilterChange("companyId", e.target.value)}
            disabled={loading}
          >
            <option value="">Todas</option>
            {companies.map((company) => (
              <option key={company.id || company._id} value={company.id || company._id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Start Date */}
        <div>
          <DateFilter
            id="startDate"
            label="Fecha Inicio"
            selectedDate={filters.startDate}
            onChange={(date) => onFilterChange("startDate", date)}
            disabled={loading}
          />
        </div>

        {/* Filter by End Date */}
        <div>
          <DateFilter
            id="endDate"
            label="Fecha Fin"
            selectedDate={filters.endDate}
            onChange={(date) => onFilterChange("endDate", date)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onClearFilters}
          className="btn-core btn-soft px-4 py-2 text-sm"
          disabled={loading || Object.keys(filters).length === 0}
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
};
