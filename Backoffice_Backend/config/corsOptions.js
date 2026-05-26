// Archivo: config/corsOptions.js
// Proposito: configuracion de infraestructura compartida (DB, CORS, entorno).

// Convierte la lista CSV de CORS_ORIGINS en arreglo utilizable.
// Funcion 'allowedOrigins': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
const allowedOrigins = (process.env.CORS_ORIGINS || "*")
  .split(",")
  .map((origin) => origin.trim());

// Configuración CORS para permitir/restringir orígenes según .env.
const corsOptions = {
  // Express/CORS invoca esta función por cada request entrante.
  origin: (origin, callback) => {
    // Permite todo si hay '*' o requests sin origin (ej. Postman/local).
    if (allowedOrigins.includes("*") || !origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Bloquea origen no permitido.
    return callback(new Error("Origen no permitido por CORS"));
  },
};

// Exporta opciones para usarlas en app.use(cors(corsOptions)).
module.exports = corsOptions;


