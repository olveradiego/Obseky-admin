/**
 * @filePurpose customerContract.js
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
/**
 * @typedef {Object} Customer
 * @property {string} [id]
 * @property {string} [\_id]
 * @property {string} businessName
 * @property {string} customerName
 * @property {string} order
 * @property {string} cardId
 * @property {string} message
 * @property {string} images
 * @property {string} video
 * @property {string} secretCode
 * @property {string} orderStatus
 * @property {string} status
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 * @property {number} [__v]
 */

export const CUSTOMER_CONTRACT_FIELDS = [
  "businessName",
  "customerName",
  "order",
  "cardId",
  "message",
  "images",
  "video",
  "secretCode",
  "orderStatus",
  "status",
  "createdAt",
  "updatedAt",
  "_id",
  "__v",
];

