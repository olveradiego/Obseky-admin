// Archivo: models/Customer.js
// Proposito: modelo Mongoose que define estructura y reglas de persistencia.

// ODM para clientes.
const mongoose = require("mongoose");

// Esquema canonico para la coleccion customers.
const customerSchema = new mongoose.Schema(
  {
    businessName: { type: String, trim: true, default: "" },
    customerName: { type: String, trim: true, default: "" },
    order: { type: String, trim: true, default: "" },
    cardId: { type: String, trim: true, default: "" },
    message: { type: String, trim: true, default: "" },
    images: { type: String, trim: true, default: "" },
    video: { type: String, trim: true, default: "" },
    secretCode: { type: String, trim: true, default: "" },
    orderStatus: { type: String, trim: true, default: "OK" },
    status: { type: String, trim: true, enum: ["Active", "Inactive"], default: "Active" },
  },
  {
    // Crea campos de auditoria temporal.
    timestamps: true,
    // Restringe nuevas escrituras al contrato del esquema.
    strict: true,
    // Usa coleccion "customers".
    collection: "customers",
  }
);

// Exporta modelo Customer.
module.exports = mongoose.model("Customer", customerSchema);


