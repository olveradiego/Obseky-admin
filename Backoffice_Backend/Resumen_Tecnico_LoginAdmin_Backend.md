# Resumen Tecnico LoginAdmin Backend

## 1. Que es este proyecto

`LoginAdmin_Backend` es un backend en Node.js con Express y MongoDB orientado a un panel administrativo. Su responsabilidad principal es:

- autenticar administradores del backoffice con JWT
- aplicar autorizacion por roles y modulos
- exponer CRUDs administrativos para empresas, clientes, clientes finales, codigos y usuarios
- generar tarjetas QR y PDFs de lotes de tarjetas
- registrar ordenes financieras asociadas a la generacion de tarjetas
- registrar gastos y exponer analiticas financieras
- entregar metadata util para que un frontend pueda autoconfigurarse

En otras palabras, este backend no es solo un login: es el API administrativo de una plataforma que maneja empresas, clientes, tarjetas/codigos QR y su contexto operativo/financiero.

## 2. Stack y dependencias

- Runtime: Node.js
- Framework HTTP: Express 4
- Base de datos: MongoDB
- ODM: Mongoose 8
- Autenticacion: JWT con `jsonwebtoken`
- Hash de passwords: `bcryptjs`
- Variables de entorno: `dotenv`
- Alias de importacion: `module-alias` con `@ => .`
- Generacion de PDF: `pdfkit`
- Generacion de QR: `qrcode`
- Desarrollo: `nodemon`

Scripts disponibles en `package.json`:

```json
{
  "start": "node app.js",
  "dev": "nodemon app.js",
  "test:contracts": "node tests/contracts.smoke.js"
}
```

## 3. Punto de entrada y arranque

Archivo principal: `app.js`

Flujo de arranque:

1. registra alias de modulos con `module-alias/register`
2. carga variables de entorno con `dotenv.config()`
3. conecta a MongoDB usando `config/database.js`
4. inicializa Express
5. configura logger simple por request
6. aplica CORS
7. habilita `express.json()`
8. monta todas las rutas bajo `/api/admin/...`
9. monta middlewares de `404` y manejo global de errores
10. levanta el servidor en `process.env.PORT || 3000`

Health check:

- `GET /`
- respuesta esperada: `{ "message": "LoginAdmin Backend activo" }`

## 4. Variables de entorno importantes

Variables detectadas en el codigo:

- `PORT`: puerto HTTP del backend
- `MONGO_URI`: cadena de conexion a MongoDB
- `CORS_ORIGINS`: lista CSV de origenes permitidos
- `JWT_SECRET`: secreto para firmar y validar JWT
- `JWT_EXPIRES_IN`: duracion del token, por ejemplo `1h`
- `DEFAULT_SUPERADMIN_EMAIL`: email del superadmin semilla
- `DEFAULT_SUPERADMIN_PASSWORD`: password del superadmin semilla
- `DEFAULT_ADMIN_EMAIL`: email del admin semilla
- `DEFAULT_ADMIN_PASSWORD`: password del admin semilla
- `FRONTEND_BASE_URL`: base URL del frontend usada para construir URLs dentro del QR
- `TEST_BASE_URL`: URL usada por el smoke test de contratos

Ejemplo de configuracion minima:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/loginadmin
JWT_SECRET=tu_secreto
JWT_EXPIRES_IN=1h
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
FRONTEND_BASE_URL=http://localhost:5173
DEFAULT_SUPERADMIN_EMAIL=superadmin@test.local
DEFAULT_SUPERADMIN_PASSWORD=admin1234
DEFAULT_ADMIN_EMAIL=admin@test.local
DEFAULT_ADMIN_PASSWORD=admin1234
```

Nota: este resumen no incluye valores reales del `.env`, solo el contrato tecnico esperado por el codigo.

## 5. Arquitectura general

El proyecto mezcla una estructura clasica por capas con una organizacion parcial por casos de uso:

- `routes/`: define endpoints HTTP
- `controllers/`: adapta request/response y delega la logica
- `application/use-cases/`: casos de uso CRUD y operaciones del dominio
- `services/`: logica de negocio y acceso a datos
- `models/`: esquemas Mongoose
- `middleware/`: autenticacion, async wrapper, manejo de errores
- `config/`: DB y CORS
- `lib/`: autorizacion, errores, validacion de ObjectId, builders de respuesta
- `tests/`: smoke test de contrato
- `docs/`: documentacion parcial del modulo users
- `images/`: assets para PDF
- `uploadsQRCards/`: PDFs generados

### Patron dominante

Para los modulos CRUD principales (`companies`, `customers`, `finalcustomers`, `users`, `codes`) se usa:

- `routes/resourceRoutesFactory.js` para declarar rutas REST estandar
- `controllers/crudControllerFactory.js` para aplicar el patron CRUD generico
- `application/use-cases/...` como adaptadores finos hacia `services/...`
- autorizacion por modulo/accion mediante `lib/authz.js`

Para modulos especiales (`auth`, `analytics`, `expenses`, `orders`, `meta`) hay rutas y servicios dedicados.

## 6. Autenticacion y autorizacion

### 6.1 Login

Ruta principal:

- `POST /api/admin/auth/login`

Recibe:

```json
{
  "email": "admin@test.local",
  "password": "admin1234"
}
```

Devuelve:

- `token` JWT
- objeto `admin` con identidad y rol

### 6.2 Token JWT

El token incluye:

- `adminId`
- `source`
- `name`
- `email`
- `role`

Se firma con `JWT_SECRET` y expira con `JWT_EXPIRES_IN`.

### 6.3 Roles

Roles oficiales normalizados:

- `SUPER_ADMIN`
- `ADMIN`

El sistema soporta variantes legacy en BD y entrada, por ejemplo:

- `SuperAdmin`
- `Admin`
- `superadmin`
- `super_admin`
- `Administrador de la empresa`

### 6.4 Matriz de permisos

`SUPER_ADMIN`:

- acceso CRUD completo a `companies`, `customers`, `finalcustomers`, `codes`, `users`, `expenses`, `orders`

`ADMIN`:

- `companies`: read, update
- `customers`: read, update
- `finalcustomers`: read, update
- `codes`: read, create, update
- `expenses`: read, create, update, delete
- `orders`: read, update
- `users`: sin acceso

### 6.5 Dos mecanismos de proteccion conviven

Hay dos estilos de seguridad en el proyecto:

- `middleware/authMiddleware.js`
  - `protect`
  - `authorize([...roles])`
- `lib/authz.js`
  - `decodeAuthorization()`
  - `authorizeModuleAction(moduleName, action)`

Esto significa que la seguridad no esta centralizada en un solo mecanismo; algunos endpoints usan middleware tradicional y otros validan el header directamente dentro del controlador.

## 7. Convencion de respuestas y errores

### Respuestas exitosas

Los CRUD genericos devuelven shapes consistentes construidos por `lib/responseBuilder.js`, normalmente:

- listas: `{ items, total }`
- item: `{ item, message? }`
- delete: `{ item: { id }, message }`
- bulk delete: `{ item: { ids }, message, requestedCount, deletedCount, deletedIds, notFoundCount, notFoundIds }`

### Errores

El middleware global `middleware/errorHandler.js` normaliza errores a este formato:

```json
{
  "backendError": {
    "code": "VALIDATION_ERROR",
    "message": "..."
  },
  "code": "VALIDATION_ERROR",
  "message": "..."
}
```

Estados usados normalmente:

- `400` validacion
- `401` no autorizado
- `403` prohibido
- `404` no encontrado
- `409` conflicto
- `500` error interno

## 8. Rutas del sistema

Base general: `/api/admin`

### 8.1 Auth

Base: `/api/admin/auth`

- `POST /seed`
  - crea o asegura admins por defecto
- `POST /login`
  - login de administrador
- `POST /admins`
  - crea admin, requiere `SUPER_ADMIN`
- `PATCH /admins/:adminId/status`
  - activa/desactiva admin
- `PATCH /admins/:adminId/password`
  - cambia password
- `GET /roles/:role/permissions`
  - devuelve permisos por rol
- `GET /permissions/check`
  - verifica permiso puntual por `moduleName` y `action`
- `GET /db-check`
  - comprueba conexion a la BD
- `GET /me`
  - devuelve perfil autenticado
- `GET /admin-area`
  - prueba de acceso para `ADMIN` y `SUPER_ADMIN`
- `GET /superadmin-area`
  - prueba exclusiva de `SUPER_ADMIN`

### 8.2 Companies

Base: `/api/admin/companies`

- `GET /`
- `GET /:id`
- `POST /`
- `PATCH /:id`
- `DELETE /bulk`
- `DELETE /:id`

### 8.3 Customers

Base: `/api/admin/customers`

- `GET /`
- `GET /:id`
- `POST /`
- `PATCH /:id`
- `DELETE /bulk`
- `DELETE /:id`

### 8.4 Final Customers

Base: `/api/admin/finalcustomers`

- `GET /`
- `GET /:id`
- `POST /`
- `PATCH /:id`
- `DELETE /bulk`
- `DELETE /:id`

### 8.5 Users

Base: `/api/admin/users`

- `GET /`
- `GET /:id`
- `POST /`
- `PATCH /:id`
- `DELETE /bulk`
- `DELETE /:id`

Este modulo esta documentado tambien en `docs/users-api-contract.md`.

### 8.6 Codes / CardCodes

Bases montadas:

- `/api/admin/cardcodes`
- `/api/admin/codes`

Rutas:

- `POST /generate/:numCodes/:purchaseType`
  - genera codigos QR en memoria y registra orden
- `POST /pdf`
  - genera PDF de tarjetas y lo devuelve como descarga
- `GET /validate/:id`
  - valida existencia y estado activo de una tarjeta
- `GET /test-generate/:num`
  - endpoint de prueba para generar PDF
- `GET /`
- `GET /:id`
- `POST /`
- `PATCH /:id`
- `DELETE /bulk`
- `DELETE /:id`

Body esperado para `POST /api/admin/codes/pdf`:

```json
{
  "quantity": 10,
  "purchaseType": true,
  "companyId": "664000000000000000000000",
  "orderNumber": "LOTE-001",
  "unitPrice": 150
}
```

### 8.7 Analytics

Base: `/api/admin/analytics`

Todas protegidas con `protect` y `authorize(['ADMIN', 'SUPER_ADMIN', 'Admin', 'SuperAdmin'])`.

- `GET /card-stats`
  - query opcional: `companyName`
- `GET /financial-summary`
  - query opcional: `companyName`, `startDate`, `endDate`
- `GET /expenses-by-category`
  - query opcional: `companyName`, `startDate`, `endDate`

### 8.8 Expenses

Base: `/api/admin/expenses`

Protegidas para administracion financiera:

- `GET /`
- `GET /:id`
- `POST /`
- `PATCH /:id`
- `DELETE /:id`

Filtros soportados por servicio:

- `companyId`
- `category`
- `startDate`
- `endDate`

### 8.9 Orders

Base: `/api/admin/orders`

Todas las rutas estan protegidas al nivel del router con `protect` y `authorize`.

- `GET /`
  - soporta `companyId` y `paymentStatus`
- `GET /:id`
- `PATCH /:id/status`
  - actualiza `paymentStatus`
- `DELETE /:id`

No existe endpoint directo de creacion manual de orden; las ordenes nacen automaticamente al generar lotes de tarjetas.

### 8.10 Meta

Base: `/api/admin/meta`

- `GET /`

Devuelve:

- `version`
- `modules`
- `enums`
- `permissionsMatrix`

Este endpoint sirve como descriptor del backend para ayudar al frontend a entender campos, enums, endpoints y permisos.

## 9. Modelos y persistencia

### 9.1 `Admin` -> coleccion `users`

Archivo: `models/Admin.js`

Campos relevantes:

- `companyName`
- `userName`
- `email` unico
- `password`
- `role`
- `status`
- `restorePassword`

Caracteristicas:

- `strict: false`
- reutiliza la coleccion legacy `users`
- admite datos heredados

### 9.2 `Company` -> coleccion `companies`

Archivo: `models/Company.js`

Caracteristicas:

- esquema vacio
- `strict: false`
- la estructura real se infiere de documentos existentes

Esto indica que el modulo de empresas depende mucho de la forma actual de los documentos en MongoDB y no de un contrato fuerte en codigo.

### 9.3 `Customer` -> coleccion `customers`

Archivo: `models/Customer.js`

Campos definidos:

- `businessName`
- `customerName`
- `order`
- `cardId`
- `message`
- `images`
- `video`
- `secretCode`
- `orderStatus`
- `status`

Caracteristicas:

- `strict: true`
- es uno de los pocos modelos con contrato claro

### 9.4 `FinalCustomer` -> coleccion `finalcustomers`

Archivo: `models/FinalCustomer.js`

Caracteristicas:

- esquema vacio
- `strict: false`

### 9.5 `CardCode` -> coleccion `cardcodes`

Archivo: `models/CardCode.js`

Campos explicitados:

- `companyId`
- `orderId`

Pero el servicio escribe ademas campos como:

- `purchaseType`
- `secretCode`
- `order`
- `randomCode`
- `companyName`
- `orderNumber`
- `status`

Caracteristicas:

- `strict: false`
- mezcla referencias formales con campos legacy duplicados

### 9.6 `Expense`

Archivo: `models/Expense.js`

Campos:

- `companyId`
- `description`
- `amount`
- `currency`
- `category`
- `paymentStatus`
- `date`

### 9.7 `Order`

Archivo: `models/Order.js`

Campos:

- `companyId`
- `orderNumber`
- `quantity`
- `unitPrice`
- `totalAmount`
- `paymentStatus`

Este modelo representa ingresos o cuentas por cobrar generadas por la venta/lote de tarjetas.

## 10. Flujo funcional importante: generacion de tarjetas QR

Este es uno de los procesos mas importantes del proyecto.

### Flujo

1. el cliente invoca un endpoint de generacion de codigos o PDF
2. se valida cantidad, `purchaseType` y `companyId`
3. se localiza la empresa
4. se crea primero una `Order`
5. se generan codigos unicos (`randomCode`)
6. se crea un `CardCode` por cada tarjeta
7. el QR apunta a `FRONTEND_BASE_URL/main/:id`
8. opcionalmente se arma un PDF usando la imagen `images/card3.jpg`
9. el PDF se guarda en `uploadsQRCards/`
10. el PDF tambien se retorna al cliente como respuesta HTTP

### Archivos clave

- `controllers/cardCodeController.js`
- `services/cardCodeService.js`
- `models/CardCode.js`
- `models/Order.js`
- `images/card3.jpg`
- `uploadsQRCards/`

### Observaciones

- la generacion del PDF depende de que exista `images/card3.jpg`
- la orden financiera se crea antes de generar las tarjetas
- el proyecto guarda PDF en disco local, por lo que el servidor mantiene estado en filesystem

## 11. Analiticas

Archivo principal: `services/analyticsService.js`

Capacidades:

- conteo de tarjetas por estado
- resumen financiero
- cuentas por cobrar
- cuentas por pagar
- gastos por categoria

Colecciones usadas:

- `cardcodes`
- `orders`
- `expenses`
- `companies`

Interpretacion funcional:

- `Order` representa ingresos
- `Expense` representa egresos
- `paymentStatus = paid` suma al realizado
- `paymentStatus = pending` suma a cuentas por cobrar/pagar

## 12. Metadata para frontend

El endpoint `/api/admin/meta` es especialmente importante.

Su objetivo es entregar al frontend:

- lista de modulos
- endpoints por modulo
- campos inferidos o definidos
- enums
- matriz de permisos

Esto sugiere que el frontend administrativo probablemente consume metadata para construir vistas o formularios con menor acoplamiento duro.

Particularidad:

- para `companies`, `finalcustomers`, `cardcodes`, `expenses` y `orders`, los campos se infieren desde un documento real en la BD
- si la coleccion esta vacia, `fields` puede llegar vacio

## 13. Estructura de carpetas explicada

```text
LoginAdmin_Backend/
|-- app.js
|-- package.json
|-- .env
|-- application/
|   `-- use-cases/
|-- config/
|   |-- corsOptions.js
|   `-- database.js
|-- controllers/
|-- docs/
|-- images/
|-- lib/
|-- middleware/
|-- models/
|-- routes/
|-- services/
|-- tests/
`-- uploadsQRCards/
```

Resumen por carpeta:

- `application/use-cases/`: casos de uso por modulo
- `config/`: inicializacion compartida
- `controllers/`: capa HTTP
- `docs/`: contratos de API documentados
- `images/`: assets usados en PDF
- `lib/`: helpers transversales
- `middleware/`: proteccion y errores
- `models/`: persistencia MongoDB
- `routes/`: definicion del API
- `services/`: negocio y acceso a datos
- `tests/`: pruebas smoke de contratos
- `uploadsQRCards/`: salida fisica de PDFs generados

## 14. Pruebas existentes

Existe una prueba de humo:

- `tests/contracts.smoke.js`

Que valida:

- autenticacion
- endpoint `/api/admin/meta`
- CRUD de `companies`, `customers`, `finalcustomers`, `codes`
- CRUD de `users`
- restriccion de permisos de `ADMIN` sobre `users`
- contrato de errores `404`

Ejecucion:

```bash
npm run test:contracts
```

La prueba usa `TEST_BASE_URL` o por defecto `http://localhost:3002`.

## 15. Contrato especial del modulo users

El modulo `users` es el mas formalizado del proyecto.

Documentacion existente:

- `docs/users-api-contract.md`

Reglas destacables:

- nuevas passwords siempre se hashean con bcrypt
- se mantiene compatibilidad con passwords legacy en texto plano para login
- `SUPER_ADMIN` tiene control total
- `ADMIN` no puede administrar usuarios
- hay validacion fuerte de payloads y `ObjectId`

## 16. Puntos tecnicos clave para entender el proyecto rapido

- la coleccion `users` contiene a los administradores del backoffice
- el backend mezcla contratos nuevos con compatibilidad legacy
- varios modelos usan `strict: false`, asi que parte del contrato real vive en la BD y no solo en el codigo
- `codes/cardcodes` es el modulo mas acoplado al negocio principal
- la generacion de tarjetas crea tambien registros financieros (`orders`)
- `expenses` y `orders` alimentan las analiticas
- `/api/admin/meta` funciona como descriptor del backend para el frontend

## 17. Riesgos y observaciones tecnicas actuales

Estos puntos no impiden entender el proyecto, pero si son importantes para cualquiera que lo mantenga:

- hay dos estrategias de autorizacion coexistiendo, lo que puede generar inconsistencias
- no todas las rutas siguen exactamente el mismo patron de seguridad
- `companies` y `finalcustomers` no tienen esquema fuerte en Mongoose
- `cardcodes` tambien opera con muchos campos fuera del esquema formal
- hay duplicidad entre `/api/admin/cardcodes` y `/api/admin/codes`
- existe un endpoint de prueba `test-generate` que conviene tratar con cuidado en ambientes productivos
- el filesystem local forma parte del flujo por `uploadsQRCards/`
- el proyecto no esta actualmente dentro de un repositorio Git inicializado en esta carpeta

## 18. Resumen ejecutivo

Este backend administra autenticacion, permisos, catalogos operativos y parte del flujo comercial de una plataforma basada en tarjetas QR. Su corazon tecnico esta en:

- JWT para acceso administrativo
- MongoDB con modelos parcialmente legacy
- CRUD generico para modulos administrativos
- generacion de tarjetas QR y PDFs
- ordenes y gastos para resumen financiero
- metadata dinamica para frontend

Si alguien nuevo entra al proyecto, lo primero que debe revisar para entenderlo bien es:

1. `app.js`
2. `services/authService.js`
3. `services/rolePermissionService.js`
4. `controllers/cardCodeController.js`
5. `services/cardCodeService.js`
6. `services/metaService.js`
7. `models/Admin.js`, `models/CardCode.js`, `models/Order.js`, `models/Expense.js`

