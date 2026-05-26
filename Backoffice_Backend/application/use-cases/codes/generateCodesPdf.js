// Archivo: application/use-cases/codes/generateCodesPdf.js
// Proposito: caso de uso 'generateCodesPdf' de la entidad 'codes'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/cardCodeService");

// Funcion 'generateCodesPdf': genera un PDF descargable con QR y crea registros asociados en la base de datos.
const generateCodesPdf = async ({ num, purchaseType, companyName, orderNumber, frontendBaseUrl }) =>
  service.generateCodesPdf({ num, purchaseType, companyName, orderNumber, frontendBaseUrl });

// Exporta el caso de uso para su consumo en controladores.
module.exports = generateCodesPdf;
