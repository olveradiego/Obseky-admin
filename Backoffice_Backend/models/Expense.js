const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'El ID de la compañía es obligatorio']
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'El monto es obligatorio'],
      min: [0, 'El monto no puede ser negativo']
    },
    currency: {
      type: String,
      default: 'MXN',
      trim: true
    },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'], // Restringimos los valores a los que espera el dashboard
      default: 'pending'
    },
    date: {
      type: Date,
      required: [true, 'La fecha del gasto es obligatoria']
    }
  },
  {
    timestamps: true // Esto añade automáticamente createdAt y updatedAt
  }
);

module.exports = mongoose.model('Expense', expenseSchema);