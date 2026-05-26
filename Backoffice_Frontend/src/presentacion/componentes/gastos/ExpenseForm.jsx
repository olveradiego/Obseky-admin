import { useState } from "react";
import { FormActions } from "@/presentacion/componentes/interfaz/FormActions";
import { FormField } from "@/presentacion/componentes/interfaz/FormField";

export const ExpenseForm = ({ initialData = {}, companies = [], onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    companyId: "",
    category: "",
    ...initialData,
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <FormField label="Descripcion" htmlFor="description">
        <input id="description" name="description" type="text" className="app-input" value={formData.description} onChange={handleChange} required />
      </FormField>

      <div className="grid gap-5 md:grid-cols-2">
        <FormField label="Monto" htmlFor="amount">
          <input id="amount" name="amount" type="number" step="0.01" min="0" className="app-input" value={formData.amount} onChange={handleChange} required />
        </FormField>
        <FormField label="Fecha" htmlFor="date">
          <input id="date" name="date" type="date" className="app-input" value={formData.date} onChange={handleChange} required />
        </FormField>
      </div>

      <FormField label="Compania" htmlFor="companyId">
        <select id="companyId" name="companyId" className="app-input" value={formData.companyId} onChange={handleChange} required>
          <option value="" disabled>
            Selecciona una compania
          </option>
          {companies.map((company) => (
            <option key={company.id || company._id} value={company.id || company._id}>
              {company.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Categoria" htmlFor="category">
        <input id="category" name="category" type="text" className="app-input" value={formData.category} onChange={handleChange} />
      </FormField>

      <FormActions>
        <button type="button" onClick={onCancel} className="app-button app-button-secondary px-4 py-2.5 text-sm" disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="app-button app-button-primary px-4 py-2.5 text-sm" disabled={loading}>
          {loading ? "Guardando..." : "Guardar gasto"}
        </button>
      </FormActions>
    </form>
  );
};

