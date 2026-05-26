// Archivo: models/Admin.js
// Proposito: modelo Mongoose que define estructura y reglas de persistencia.

// ODM para mapear documentos de MongoDB a objetos JavaScript.
const mongoose = require("mongoose");

// Esquema de administradores en la colección "users".
// Se mantiene flexible para convivir con campos legacy existentes.
const adminSchema = new mongoose.Schema(
  {
    // Nombre de empresa asociado al usuario (si aplica).
    companyName: { type: String, trim: true },
    // Nombre visible del usuario administrador.
    userName: { type: String, trim: true },
    // Correo de login (único).
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // Password almacenada (hash bcrypt para usuarios nuevos).
    password: {
      type: String,
      required: true,
      trim: true,
    },
    // Rol autorizado; admite formato nuevo y legacy.
    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "ADMIN",
        "SuperAdmin",
        "Admin",
        "Administrador de la empresa",
        "Super Administrador de la empresa",
      ],
      required: true,
      default: "Admin",
      trim: true,
    },
    // Estado funcional del usuario en esquema legacy.
    status: { type: String, default: "Activo", trim: true },
    // Campo legacy para flujos de recuperación (si ya existe en la BD).
    restorePassword: { type: Number, default: 0 },
  },
  {
    // Agrega createdAt y updatedAt automáticamente.
    timestamps: true,
    // Fuerza uso de la colección existente "users".
    collection: "users",
    // Permite campos no definidos en el esquema para compatibilidad legacy.
    strict: false,
  }
);

// Exporta el modelo para consultas y operaciones CRUD.
module.exports = mongoose.model("Admin", adminSchema);


