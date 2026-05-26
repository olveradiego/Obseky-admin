// Archivo: models/CardCode.js
// Proposito: modelo Mongoose que define estructura y reglas de persistencia.

// ODM principal para la colección de códigos.
const mongoose = require("mongoose");

// Esquema flexible: acepta cualquier estructura ya existente en cardcodes.
const cardCodeSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  purchaseType: {
    type: String,
  },
  secretCode: {
    type: String,
  },
  order: {
    type: String,
  },
  randomCode: {
    type: String,
  },
  companyName: {
    type: String,
  },
  orderNumber: {
    type: String,
  },
  status: {
    type: String,
    default: "Active",
  }
}, {
  timestamps: true,
  collection: "cardcodes",
});

// Exporta modelo CardCode para operaciones CRUD.
module.exports = mongoose.model("CardCode", cardCodeSchema);
