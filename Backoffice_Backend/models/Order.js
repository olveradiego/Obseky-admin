// Archivo: models/Order.js
// Proposito: Modelo Mongoose para registrar órdenes de venta (finanzas/ingresos).

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "El ID de la compañía es obligatorio"],
    },
    orderNumber: {
      type: String,
      required: [true, "El número de lote (orden) es obligatorio"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "La cantidad debe ser al menos 1"],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, "El precio unitario no puede ser negativo"],
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending", // Por defecto, una venta nueva entra como "pendiente" de pago
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);