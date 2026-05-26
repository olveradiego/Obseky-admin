/**
 * @filePurpose currencyUtils.js
 * @description Funciones utilitarias para el formateo de moneda.
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN", // O la moneda que corresponda
  }).format(value || 0);
};