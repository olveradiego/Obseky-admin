// Archivo: config/database.js
// Proposito: configuracion de infraestructura compartida (DB, CORS, entorno).

// Cliente ODM de MongoDB.
const mongoose = require("mongoose");

// Conecta a la base de datos usando MONGO_URI del .env.
// Funcion 'connectDB': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const connectDB = async () => {
  try {
    // Lee la cadena de conexión desde variables de entorno.
    const mongoURI = process.env.MONGO_URI;

    // Falla explícitamente si no existe la variable requerida.
    if (!mongoURI) {
      throw new Error("Falta la variable MONGO_URI en el .env");
    }

    // Abre la conexión con MongoDB.
    await mongoose.connect(mongoURI);
    console.log("MongoDB conectada");
  } catch (error) {
    // Reporta error y detiene el proceso para evitar iniciar sin DB.
    console.error("Error al conectar MongoDB:", error.message);
    process.exit(1);
  }
};

// Exporta la función para usarla en app.js al arrancar el backend.
module.exports = connectDB;


