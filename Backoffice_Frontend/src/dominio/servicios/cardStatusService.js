/**
 * @filePurpose cardStatusService.js
 * @description Servicio de dominio para determinar el estado de "vendido" de una tarjeta.
 */

/**
 * @function isCardSold
 * @description Determina si una tarjeta se considera "vendida" basándose en su estado.
 * @param {object} card - El objeto de la tarjeta con una propiedad 'status'.
 * @returns {boolean} - Verdadero si la tarjeta se considera vendida, falso en caso contrario.
 */
export const isCardSold = (card) => {
  if (!card || typeof card.status !== 'string') return false;
  const status = card.status.toLowerCase();
  return status === 'creado' || status === 'visto';
};