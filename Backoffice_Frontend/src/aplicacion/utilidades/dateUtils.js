/**
 * @filePurpose dateUtils.js
 * @description Funciones utilitarias para el manejo y formateo de fechas.
 */
export const getFormattedDate = (date) => {
  if (!date) return "";
  
  // Si ya es un string con formato YYYY-MM-DD, lo devolvemos tal cual
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    
    // Usamos metodos locales para evitar saltos de zona horaria (UTC vs Local)
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

export const calculateDatesForPreset = (preset) => {
  const today = new Date();
  let start = null;
  let end = null;

  switch (preset) {
    case "last7days":
      start = new Date(today);
      start.setDate(today.getDate() - 6); // Last 7 days including today
      end = today;
      break;
    case "thisMonth":
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = today;
      break;
    case "lastMonth":
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of previous month
      break;
    case "thisYear":
      start = new Date(today.getFullYear(), 0, 1);
      end = today;
      break;
    case "lastYear":
      start = new Date(today.getFullYear() - 1, 0, 1);
      end = new Date(today.getFullYear() - 1, 11, 31);
      break;
  }
  return [start, end];
};