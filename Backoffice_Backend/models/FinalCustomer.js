// Archivo: models/FinalCustomer.js
// Proposito: modelo Mongoose que define estructura y reglas de persistencia.

// ODM para cliente final.
const mongoose = require("mongoose");

// Esquema abierto para soportar estructura actual de finalcustomers.
const finalCustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: "Active",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  {
    // Habilita createdAt y updatedAt.
    timestamps: true,
    // Colección asociada en MongoDB.
    collection: "finalcustomers",
  }
);

// Exporta modelo FinalCustomer.
module.exports = mongoose.model("FinalCustomer", finalCustomerSchema);


