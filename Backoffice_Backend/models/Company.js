// Archivo: models/Company.js
// Proposito: modelo Mongoose que define estructura y reglas de persistencia.

// ODM para documentos de empresas.
const mongoose = require("mongoose");

// Esquema abierto para no romper estructura existente de la colección.
const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      default: "Active",
    },
  },
  {
    // Incluye createdAt/updatedAt.
    timestamps: true,
    // Colección objetivo en MongoDB.
    collection: "companies",
  }
);

// Exporta modelo Company.
module.exports = mongoose.model("Company", companySchema);


