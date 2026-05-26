import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";

registerLocale("es", es);

/**
 * @filePurpose DateFilter.jsx
 * @description Componente reutilizable para filtros de fecha con un diseño estandarizado.
 */
export const DateFilter = ({
  id,
  label,
  selectedDate,
  onChange,
  placeholder = "YYYY-MM-DD",
  disabled = false,
}) => {
  // Esta función se encarga de convertir una cadena "YYYY-MM-DD" a un objeto Date,
  // evitando problemas de zona horaria al tratar la fecha como local.
  const parseDate = (dateString) => {
    if (!dateString) return null;
    // Se añade 'T00:00:00' para asegurar que la fecha se interprete en la zona horaria local del usuario,
    // en lugar de UTC. Esto evita que la fecha se desplace un día.
    const date = new Date(`${dateString}T00:00:00`);
    // Comprueba si la fecha creada es válida.
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  };

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <DatePicker
        id={id}
        selected={parseDate(selectedDate)}
        onChange={(date) => onChange(date ? date.toISOString().split("T")[0] : "")}
        dateFormat="yyyy-MM-dd"
        className="input-core w-full"
        placeholderText={placeholder}
        locale="es"
        disabled={disabled}
        isClearable
      />
    </div>
  );
};