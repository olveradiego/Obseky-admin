import { DateFilter } from "../compartido/DateFilter";
import { FilterBar } from "@/presentacion/componentes/interfaz/FilterBar";
import { FormField } from "@/presentacion/componentes/interfaz/FormField";

export const AnalyticsFilters = ({
  companies,
  selectedCompany,
  handleCompanyChange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  selectedPresetRange,
  handlePresetRangeChange,
  handleResetFilters,
  loading,
}) => {
  const presetRanges = [
    { label: "Hoy", value: "today" },
    { label: "Ayer", value: "yesterday" },
    { label: "Ultimos 7 dias", value: "last7days" },
    { label: "Ultimos 30 dias", value: "last30days" },
    { label: "Este mes", value: "thisMonth" },
    { label: "Mes pasado", value: "lastMonth" },
  ];

  return (
    <FilterBar className="border-0 bg-transparent p-0 shadow-none">
      <div className="xl:col-span-3">
        <FormField label="Compania" htmlFor="companyId">
          <select
            id="companyId"
            className="app-input"
            value={selectedCompany}
            onChange={(e) => handleCompanyChange(e.target.value)}
            disabled={loading}
          >
            <option value="global">Todas las empresas</option>
            {companies.map((company) => (
              <option key={company.id || company._id} value={company.name || company.companyName}>
                {company.name || company.companyName}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="xl:col-span-3">
        <FormField label="Rango predefinido" htmlFor="datePreset">
          <select
            id="datePreset"
            className="app-input"
            value={selectedPresetRange}
            onChange={handlePresetRangeChange}
            disabled={loading}
          >
            <option value="">Personalizado</option>
            {presetRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div
        className="xl:col-span-2"
        onClick={() => {
          if (selectedPresetRange) handlePresetRangeChange({ target: { value: "" } });
        }}
      >
        <DateFilter
          id="startDate"
          label="Fecha inicio"
          selectedDate={startDate}
          onChange={(date) => {
            if (selectedPresetRange) handlePresetRangeChange({ target: { value: "" } });
            setStartDate(date);
          }}
          disabled={loading}
        />
      </div>

      <div
        className="xl:col-span-2"
        onClick={() => {
          if (selectedPresetRange) handlePresetRangeChange({ target: { value: "" } });
        }}
      >
        <DateFilter
          id="endDate"
          label="Fecha fin"
          selectedDate={endDate}
          onChange={(date) => {
            if (selectedPresetRange) handlePresetRangeChange({ target: { value: "" } });
            setEndDate(date);
          }}
          disabled={loading}
        />
      </div>

      <div className="flex items-end xl:col-span-2">
        <button
          onClick={handleResetFilters}
          className="app-button app-button-secondary w-full px-4 py-3 text-sm"
          disabled={loading}
        >
          Limpiar filtros
        </button>
      </div>
    </FilterBar>
  );
};

