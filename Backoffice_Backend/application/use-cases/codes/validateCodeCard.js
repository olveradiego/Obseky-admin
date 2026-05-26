// Archivo: application/use-cases/codes/validateCodeCard.js
// Proposito: caso de uso 'validateCodeCard' de la entidad 'codes'; orquesta una accion puntual del dominio.

// Servicio de la entidad que expone operaciones de consulta/persistencia.
const service = require("../../../services/cardCodeService");

// Funcion 'validateCodeCard': valida existencia y estado activo de un codigo/tarjeta por id.
const validateCodeCard = async (id) => service.validateActiveCode(id);

// Exporta el caso de uso para su consumo en controladores.
module.exports = validateCodeCard;
