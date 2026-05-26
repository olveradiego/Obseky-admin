// Archivo: application/use-cases/codes/generateCodesQr.js
// Proposito: caso de uso 'generateCodesQr' de la entidad 'codes'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/cardCodeService");

// Funcion 'generateCodesQr': crea codigos con QR en memoria y persiste metadatos en base de datos.
const generateCodesQr = async ({ numCodes, purchaseType, companyName, orderNumber, frontendBaseUrl }) =>
  service.generateCodesWithQr({ numCodes, purchaseType, companyName, orderNumber, frontendBaseUrl });

// Exporta el caso de uso para su consumo en controladores.
module.exports = generateCodesQr;
