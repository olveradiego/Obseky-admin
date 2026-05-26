// Archivo: app.js
// Proposito: punto de entrada del backend; inicializa entorno, middlewares, rutas y servidor HTTP.

const path = require("path");
// Registra los alias de rutas configurados en package.json
require("module-alias/register");

// Carga el framework HTTP para construir la API REST.
const express = require("express");
// Habilita control de CORS para permitir/restringir orígenes.
const cors = require("cors");
// Permite leer variables de entorno desde el archivo .env.
const dotenv = require("dotenv");
// Inicializa variables de entorno antes de cargar modulos que leen process.env al importarse.
dotenv.config();

// Conexión a MongoDB.
const connectDB = require("@/config/database");
// Reglas CORS configurables por variable de entorno.
const corsOptions = require("@/config/corsOptions");
// Rutas del módulo de autenticación/autorización de administradores.
const authRoutes = require("@/routes/authRoutes");
// Rutas CRUD para la colección cardcodes.
const cardCodeRoutes = require("@/routes/cardCodeRoutes");
// Rutas CRUD para la colección companies.
const companyRoutes = require("@/routes/companyRoutes");
// Rutas CRUD para la colección customers.
const customerRoutes = require("@/routes/customerRoutes");
// Rutas CRUD para la colección finalcustomers.
const finalCustomerRoutes = require("@/routes/finalCustomerRoutes");
// Rutas para las analíticas del backoffice.
const analyticsRoutes = require("@/routes/analyticsRoutes");
// Rutas para la gestión de gastos.
const expenseRoutes = require("@/routes/expenseRoutes");
// Rutas para la gestión de ventas / órdenes financieras
const orderRoutes = require("@/routes/orderRoutes");
const userRoutes = require("@/routes/userRoutes");
const metaRoutes = require("@/routes/metaRoutes");
const publicRoutes = require("@/routes/publicRoutes");
const { notFoundMiddleware, errorHandler } = require("@/middleware/errorHandler");


// Crea la instancia principal de la aplicación Express.
const app = express();
// Define puerto de arranque; usa 3000 por defecto si no está en .env.
const PORT = process.env.PORT || 3000;

// Establece conexión con la base de datos al iniciar la aplicación.
connectDB();

// Logger simple por request: método, ruta, estado y tiempo de respuesta.
app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms)`);
  });

  next();
});

// Aplica política CORS global.
app.use(cors(corsOptions));
// Habilita parseo de JSON en el body de requests.
app.use(express.json());

//Hacer la carpeta images accesible
app.use('/images',
  express.static(path.join(__dirname, 'images')))

// Health endpoint básico para comprobar que el servidor responde.
app.get("/", (req, res) => {
  res.json({ message: "LoginAdmin Backend activo" });
});

// Monta rutas de autenticación bajo /api/admin/auth.
app.use("/api/admin/auth", authRoutes);

// Monta rutas de codes bajo /api/admin/codes.
app.use("/api/admin/codes", cardCodeRoutes);

// Monta rutas de companies bajo /api/admin/companies.
app.use("/api/admin/companies", companyRoutes);

// Monta rutas de customers bajo /api/admin/customers.
app.use("/api/admin/customers", customerRoutes);

// Monta rutas de finalcustomers bajo /api/admin/finalcustomers.
app.use("/api/admin/finalcustomers", finalCustomerRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/meta", metaRoutes);

// Monta rutas de analíticas bajo /api/admin/analytics.
app.use("/api/admin/analytics", analyticsRoutes);

// Monta rutas de gastos bajo /api/admin/expenses.
app.use("/api/admin/expenses", expenseRoutes);

// Monta rutas de ordenes financieras bajo /api/admin/orders.
app.use("/api/admin/orders", orderRoutes);

// Monta rutas publicas
app.use("/api/public", publicRoutes);

// Endpoint publico para generar lotes de tarjetas (PDF) directamente con GET sin autenticacion
app.get("/api/cards/:num", async (req, res, next) => {
  try {
    const num = parseInt(req.params.num, 10);
    const Company = require("./models/Company");
    const cardCodeService = require("./services/cardCodeService");

    // Buscamos la primera compañía o creamos una por defecto si no existe
    let company = await Company.findOne({});
    if (!company) {
      company = await Company.create({
        name: "Default Company",
        companyName: "Default Company",
        status: "Active"
      });
    }

    const result = await cardCodeService.generateCodesPdf({
      num,
      purchaseType: true,
      companyId: company._id,
      orderNumber: `PUBLIC-GET-${Date.now()}`,
      unitPrice: 0,
      designId: "diseño_1",
      frontendBaseUrl: process.env.FRONTEND_BASE_URL || "https://obseky.com",
      pdfFormat: "backs"
    });

    res.setHeader("Content-Type", result.contentType);
    res.setHeader("Content-Disposition", `inline; filename="${result.filename}"`);
    return res.status(200).send(result.buffer);
  } catch (error) {
    next(error);
  }
});

app.use(notFoundMiddleware);
app.use(errorHandler);

// Inicia el servidor HTTP en el puerto configurado.
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
