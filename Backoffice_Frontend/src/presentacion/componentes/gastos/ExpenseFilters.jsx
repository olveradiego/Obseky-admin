import React from 'react';

export const ExpenseFilters = ({ companies = [], filters = {}, onFilterChange, onClearFilters, loading = false }) => {
  const handleInputChange = (e) => {
    onFilterChange(e.target.name, e.target.value);
  };

  const hasFilters = Object.values(filters).some((val) => val !== '' && val !== null && val !== undefined);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label htmlFor="search" className="field-label">
            Buscar
          </label>
          <input
            type="text"
            id="search"
            name="search"
            placeholder="Descripción o categoría..."
            className="input-core mt-1 h-10 w-full py-2 text-sm leading-5"
            value={filters.search || ''}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="companyId" className="field-label">
            Compañía
          </label>
          <select
            id="companyId"
            name="companyId"
            className="input-core mt-1 h-10 w-full py-2 text-sm leading-5"
            value={filters.companyId || ''}
            onChange={handleInputChange}
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
        <div>
          <label htmlFor="startDate" className="field-label">
            Fecha de Inicio
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            className="input-core mt-1 h-10 w-full py-2 text-sm leading-5"
            value={filters.startDate || ''}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="endDate" className="field-label">
            Fecha de Fin
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            className="input-core mt-1 h-10 w-full py-2 text-sm leading-5"
            value={filters.endDate || ''}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>
      </div>
      {hasFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClearFilters}
            className="btn-core btn-soft px-4 py-2 text-xs"
            disabled={loading}
          >
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
};