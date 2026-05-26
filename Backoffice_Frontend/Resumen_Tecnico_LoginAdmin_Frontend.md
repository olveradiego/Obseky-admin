# Resumen Tecnico LoginAdmin Frontend

## 1. Contexto general del proyecto

`LoginAdmin_Frontend` es una aplicacion web administrativa construida con `React 19` y `Vite` para operar modulos internos relacionados con:

- autenticacion de administradores
- gestion de usuarios
- gestion de companias
- gestion de clientes y clientes finales
- generacion y consulta de codigos/tarjetas
- gastos, ordenes y resumen financiero
- analiticas de tarjetas y finanzas

Su objetivo es servir como panel administrativo conectado a un backend que expone endpoints bajo el prefijo `/api/admin`.

La aplicacion no funciona como un sitio publico; es un panel autenticado con control de acceso por rol y por permisos devueltos por backend.

## 2. Stack tecnologico

- `React 19.2.0`
- `React Router DOM 7.13.0`
- `Vite 5`
- `Tailwind CSS 4`
  - Nota: Se ha actualizado la sintaxis para valores arbitrarios de `[var(--...)]` a `(--...)` en varios componentes para alinearse con los estandares de la v4.
- `Chart.js` + `react-chartjs-2`
- `date-fns`
- `lucide-react`
- `vite-plugin-pwa`

Archivos clave:

- [package.json](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/package.json)
- [vite.config.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/vite.config.js)
- [src/main.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/main.jsx)
- [src/App.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/App.jsx)

## 3. Como se ejecuta

Scripts disponibles:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

Detalles relevantes:

- el proyecto usa alias `@` apuntando a `./src`
- el servidor de desarrollo define proxy de `/api` hacia `http://localhost:3002`
- tambien existe configuracion explicita de `API_BASE_URL` por variable `VITE_API_BASE_URL`
- hay soporte PWA con `vite-plugin-pwa`

## 4. Configuracion de entorno

La base URL del backend se resuelve en:

- [src/infraestructura/configuracion/env.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/infraestructura/configuracion/env.js)

Comportamiento:

- primero intenta usar `import.meta.env.VITE_API_BASE_URL`
- si no existe, usa fallback `http://localhost:3002`
- elimina slash final para evitar rutas dobles

Esto significa que el frontend espera un backend compatible corriendo por defecto en puerto `3002`.

## 5. Arquitectura general

El proyecto sigue una separacion por capas bastante clara:

### `src/presentacion`

Contiene UI, paginas, componentes, hooks de interfaz y contexto de sesion.

Ejemplos:

- paginas: `pages/`
- componentes reutilizables: `components/`
- hooks de UI y orquestacion: `hooks/`
- contexto global de sesion: `context/`

### `src/aplicacion`

Contiene la logica de aplicacion: casos de uso, adapters, mappers, manejo de errores y utilidades.

Ejemplos:

- `use-cases/`
- `adapters/`
- `mappers/`
- `errors/`
- `utils/`

### `src/dominio`

Contiene reglas y conceptos del negocio:

- constantes de modulos
- constantes de permisos
- reglas de clientes
- servicios de permisos
- contratos

### `src/infraestructura`

Contiene acceso tecnico a recursos externos:

- cliente HTTP
- parseo de errores
- repositorios
- storage local
- variables de entorno

## 6. Punto de entrada y arranque

Flujo de inicio:

1. [src/main.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/main.jsx) monta `App` dentro de `BrowserRouter`.
2. [src/App.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/App.jsx) envuelve toda la aplicacion con `SessionProvider`.
3. `SessionProvider` restaura sesion desde `localStorage`, valida token y carga metadata remota.
4. `ProtectedRoute` protege rutas privadas.
5. `AppLayout` renderiza navegacion superior y contenedor principal.

## 7. Flujo de autenticacion y sesion

Archivos principales:

- [src/presentacion/contexto/SessionContext.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/contexto/SessionContext.jsx)
- [src/aplicacion/casos-de-uso/loginAndLoadProfile.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/aplicacion/casos-de-uso/loginAndLoadProfile.js)
- [src/infraestructura/repositorios/authRepository.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/infraestructura/repositorios/authRepository.js)
- [src/infraestructura/repositorios/metaRepository.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/infraestructura/repositorios/metaRepository.js)
- [src/infraestructura/almacenamiento/sessionStorage.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/infraestructura/almacenamiento/sessionStorage.js)

Flujo:

1. el usuario captura `email` y `password` en `LoginPage`
2. `login()` llama al caso de uso `loginAndLoadProfile`
3. el repositorio de auth consume:
   - `POST /api/admin/auth/login`
   - `GET /api/admin/auth/me`
4. despues se consulta metadata:
   - `GET /api/admin/meta`
5. se guarda en `localStorage`:
   - `apiBase`
   - `token`
6. al recargar la app, `SessionProvider` intenta restaurar la sesion con `refreshProfile()`

La metadata remota se adapta con `buildMetaConfig()` y queda disponible como `metaConfig`.

## 8. Autorizacion y control de acceso

Archivos clave:

- [src/presentacion/componentes/ProtectedRoute.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/componentes/ProtectedRoute.jsx)
- [src/presentacion/componentes/SuperAdminRoute.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/componentes/SuperAdminRoute.jsx)
- [src/dominio/servicios/permissionService.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/dominio/servicios/permissionService.js)

Modelo de autorizacion:

- si no hay token, se redirige a `/login`
- si el rol es `SUPER_ADMIN`, se concede acceso total
- si no, se evalua:
  - `profile.permissions` devuelto por backend
  - `permissionsMatrix` dentro de `metaConfig`
- los aliases de acciones soportan equivalencias como:
  - `GET` -> `read`, `view`, `list`
  - `POST` -> `create`, `write`, `add`
  - `PATCH` -> `update`, `edit`
  - `DELETE` -> `remove`

Esto permite que la UI no dependa solo del rol nominal, sino de permisos efectivos.

## 9. Rutas principales de la aplicacion

Definidas en:

- [src/App.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/App.jsx)

Rutas:

- `/login`: pantalla de acceso
- `/`: dashboard principal
- `/analytics`: Analiticas
- `/finanzas`: Panel financiero
- `/modules/cardcodes`: Renombrado en UI a "Generar Tarjetas"
- `/modules/users`: Gestion de usuarios (protegida por `SuperAdminRoute`)
- `/modules/companies`: Gestion de companias

Nota: La navegacion principal en `AppLayout.jsx` fue simplificada para eliminar accesos redundantes (Clientes, Ordenes, Gastos) que ya estan accesibles desde otras secciones.

## 10. Catalogo funcional de modulos

La definicion central esta en:

- [src/dominio/constantes/modules.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/dominio/constantes/modules.js)

Modulos registrados:

- `companies`
- `customers`
- `finalcustomers`
- `cardcodes`
- `users`
- `expenses`
- `orders`

Cada modulo puede declarar:

- `key`
- `permissionKey`
- `label`
- `description`
- `defaultPayload`
- en algunos casos `fields`

Esta definicion sirve como base local, pero la configuracion real de endpoints y campos puede venir enriquecida desde el backend via metadata.

## 11. Integracion con backend

### Endpoints base

Archivo:

- [src/infraestructura/http/endpoints.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/infraestructura/http/endpoints.js)

Prefijo:

- `/api/admin`

Auth:

- `/api/admin/auth/login`
- `/api/admin/auth/me`
- `/api/admin/meta`

### Cliente HTTP

Archivo:

- [src/infraestructura/http/httpClient.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/infraestructura/http/httpClient.js)

Responsabilidades:

- ejecutar `fetch`
- adjuntar token bearer
- serializar JSON
- manejar timeout con `AbortController`
- retornar respuesta normalizada `{ ok, status, data, error }`
- soportar descargas binarias

### Repositorio dinamico

Archivo:

- [src/infraestructura/repositorios/moduleRepository.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/infraestructura/repositorios/moduleRepository.js)

Responsabilidades:

- operaciones CRUD genericas
- `bulkDelete`
- operaciones custom por metadata
- descargas binarias
- helpers especializados para analytics:
  - `getCardStats`
  - `getFinancialSummary`
  - `getExpensesByCategory`

Observacion importante:

- casi todas las rutas pasan por `/api/admin/...`
- `updateOrderStatus()` actualmente usa `/admin/orders/${id}/status` sin el prefijo `/api`; conviene revisarlo porque rompe el patron general

## 12. Metadata remota y formularios dinamicos

Archivo clave:

- [src/aplicacion/adaptadores/metaConfigAdapter.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/aplicacion/adaptadores/metaConfigAdapter.js)

La metadata del backend se transforma en:

- `modulesByKey`
- `moduleKeys`
- `enums`
- `permissionsMatrix`

Con eso el frontend puede construir:

- catalogo de endpoints por modulo
- formularios dinamicos
- selects para enums
- payloads para `CREATE` y `PATCH`
- activacion/desactivacion de campos mutables

Esto hace que el frontend sea parcialmente dirigido por configuracion del backend.

## 13. Flujo CRUD generico

Piezas principales:

- [src/presentacion/paginas/modulos/ModuleCrudPage.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/paginas/modulos/ModuleCrudPage.jsx)
- [src/presentacion/ganchos/useModuleCrud.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/ganchos/useModuleCrud.js)
- [src/aplicacion/casos-de-uso/dispatchModuleCrudUseCase.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/aplicacion/casos-de-uso/dispatchModuleCrudUseCase.js)
- [src/presentacion/componentes/CrudTester.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/componentes/CrudTester.jsx)

Flujo:

1. `ModuleCrudPage` resuelve el `moduleKey`
2. `useModuleCrud` crea el estado, permisos, formulario y acciones
3. `dispatchModuleCrudUseCase` enruta la operacion al caso de uso correcto
4. el caso de uso usa `moduleRepository`
5. el resultado vuelve a la UI con estados normalizados:
   - `idle`
   - `loading`
   - `success`
   - `error`
   - `empty`

Capacidades del hook:

- listar
- obtener por ID
- crear
- actualizar
- eliminar
- eliminacion masiva
- seleccion de filas
- paginacion local
- generacion de QR/PDF para tarjetas
- validacion de tarjeta

## 14. Modulos y pantallas importantes

### Login

- [src/presentacion/paginas/LoginPage.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/paginas/LoginPage.jsx)
- [src/presentacion/componentes/LoginForm.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/componentes/LoginForm.jsx)

Pantalla de acceso basada en `SessionContext`.

### Dashboard principal

- [src/presentacion/paginas/DashboardHomePage.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/paginas/DashboardHomePage.jsx)

Muestra:

- Bienvenida al usuario autenticado.
- Resumen financiero global (corregido para mostrar una cuadricula de 3x2 en todas las resoluciones).
- Accesos rapidos a modulos principales.
- Resumen de permisos del usuario.

### Analytics

- [src/presentacion/paginas/AnalyticsPage.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/paginas/AnalyticsPage.jsx)
- [src/presentacion/ganchos/useAnalyticsData.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/ganchos/useAnalyticsData.js)
- [src/presentacion/componentes/analiticas/AnalyticsFilters.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/componentes/analiticas/AnalyticsFilters.jsx)

Muestra:

- resumen financiero
- estadisticas de tarjetas
- gastos por categoria
- exportacion CSV
- filtros por compania y fecha

### Finanzas

- [src/presentacion/paginas/FinancesPage.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/paginas/FinancesPage.jsx)

Integra varias vistas:

- Resumen financiero (corregido para mostrar una cuadricula de 3x2).
- Gastos (vista CRUD completa).
- Ordenes (vista CRUD completa).

Observacion:

- esta pagina consulta varios endpoints directamente con `fetch`
- funcionalmente se traslapa con `AnalyticsPage`
- parece una pantalla mas antigua o paralela a la version mas modular de analytics

### Usuarios

- [src/presentacion/paginas/UsersPage.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/paginas/UsersPage.jsx)

Vista custom con:

- formulario maestro
- tabla
- filtros
- CRUD manual sobre el repositorio

### Companias

- [src/presentacion/paginas/modulos/CompaniesPage.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/paginas/modulos/CompaniesPage.jsx)

Vista especializada con patron master-detail y formulario.

### Clientes y clientes finales

- `CustomersPage`
- `FinalCustomersPage`

Actualmente montan `ModuleCrudPage`, es decir, usan el flujo CRUD generico.

### Tarjetas / codigos

Hay dos enfoques coexistiendo:

- [src/presentacion/paginas/CardCodesPage.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/paginas/CardCodesPage.jsx)
  - vista personalizada para generar PDF
- `useModuleCrud` + casos de uso de `codes`
  - enfoque mas generico y extensible para QR, PDF y validacion

### Gastos

- [src/presentacion/paginas/modulos/ExpensesPage.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/paginas/modulos/ExpensesPage.jsx)

Submodulo especializado con:

- filtros
- modal
- tabla de gastos
- exportacion CSV
- soporte de paginacion y CRUD

## 15. Hooks principales

### Hooks de sesion

- [src/presentacion/ganchos/useSession.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/ganchos/useSession.js)

Consume `SessionContext`.

### Hooks de analiticas

- [src/presentacion/ganchos/useAnalyticsData.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/ganchos/useAnalyticsData.js)
- [src/presentacion/ganchos/useDateFilters.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/ganchos/useDateFilters.js)
- [src/presentacion/ganchos/useCompanyFilter.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/ganchos/useCompanyFilter.js)
- [src/presentacion/ganchos/useCsvExport.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/ganchos/useCsvExport.js)

### Hook CRUD

- [src/presentacion/ganchos/useModuleCrud.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/ganchos/useModuleCrud.js)

Es uno de los hooks mas importantes del sistema porque concentra la mayor parte de la operacion administrativa reutilizable.

## 16. Estructura de carpetas recomendada para entender el repo

```text
src/
  aplicacion/
    adapters/
    errors/
    mappers/
    use-cases/
    utils/
  dominio/
    constants/
    contracts/
    rules/
    services/
  infraestructura/
    config/
    http/
    repositories/
    storage/
  presentacion/
    components/
    context/
    hooks/
    pages/
```

Ruta mental para entender una accion de negocio:

1. `presentacion/pages` dispara la accion
2. `presentacion/hooks` la orquesta
3. `aplicacion/use-cases` aplica logica
4. `infraestructura/repositories` habla con backend
5. `domain` define reglas y permisos

## 17. Flujos tecnicos importantes

### Flujo de login

`LoginForm` -> `SessionContext.login()` -> `authRepository.login()` -> `authRepository.getProfile()` -> `metaRepository.getMeta()` -> guardar token y metadata

### Flujo CRUD de un modulo generico

Pagina -> `useModuleCrud.run()` -> `dispatchModuleCrudUseCase()` -> caso de uso por entidad -> `moduleRepository` -> backend

### Flujo de analytics

Filtros -> `useAnalyticsData()` -> requests paralelos a endpoints de analytics -> normalizacion -> componentes graficos

## 18. Archivos mas importantes para onboarding rapido

Si alguien nuevo entra al proyecto, deberia leer primero:

1. [src/App.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/App.jsx)
2. [src/presentacion/contexto/SessionContext.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/contexto/SessionContext.jsx)
3. [src/infraestructura/repositorios/moduleRepository.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/infraestructura/repositorios/moduleRepository.js)
4. [src/aplicacion/adaptadores/metaConfigAdapter.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/aplicacion/adaptadores/metaConfigAdapter.js)
5. [src/presentacion/ganchos/useModuleCrud.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/ganchos/useModuleCrud.js)
6. [src/dominio/constantes/modules.js](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/dominio/constantes/modules.js)
7. [src/presentacion/paginas/AnalyticsPage.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/paginas/AnalyticsPage.jsx)
8. [src/presentacion/paginas/FinancesPage.jsx](c:/Users/kory_/OneDrive/Desktop/Proyectos/LoginAdmin_Frontend/src/presentacion/paginas/FinancesPage.jsx)

## 19. Estado actual del codigo y observaciones tecnicas

### 1. Conviven dos estilos de implementacion

Hay una parte del proyecto mas alineada a arquitectura por capas y hooks reutilizables, y otra parte con vistas que hacen `fetch` directo o CRUD manual desde la pagina.

Ejemplos:

- mas estructurado: `SessionContext`, `useModuleCrud`, `AnalyticsPage`
- mas directo/especializado: `FinancesPage`, `UsersPage`, `CardCodesPage`, `CompaniesPage`

### 2. Hay funcionalidad duplicada o paralela

`AnalyticsPage` y `FinancesPage` tocan dominios parecidos y consumen endpoints similares.

### 3. La metadata del backend es una pieza central

Sin `metaConfig`, el sistema pierde buena parte de su capacidad dinamica:

- endpoints
- campos
- enums
- permisos

### 4. Hay indicios de problemas de codificacion de caracteres

En varios archivos aparecen textos como `CompaÃƒÂ±ÃƒÂ­as`, `AutorizaciÃƒÂ³n`, `NAVEGACIÃƒâ€œN`. Eso apunta a una inconsistencia de encoding en algunos archivos fuente.

### 5. Hay mezcla de nombres en ingles y espanol

No rompe funcionalidad, pero aumenta costo cognitivo:

- rutas y codigo tecnico en ingles
- labels y mensajes de negocio en espanol
- algunas claves de backend en ingles, otras en espanol

## 20. Que tocar segun el tipo de cambio

Si necesitas:

- cambiar rutas o proteccion de acceso: `src/App.jsx`, `ProtectedRoute`, `SuperAdminRoute`
- cambiar login o restauracion de sesion: `SessionContext`, `authRepository`, `metaRepository`
- agregar un nuevo modulo CRUD: `dominio/constantes/modules.js`, metadata backend, casos de uso, pagina o `ModuleCrudPage`
- cambiar formularios dinamicos: `src/presentacion/paginas/modulos/ModuleEntityFormPage.jsx`
- cambiar permisos: `permissionService.js` y `permissionsMatrix`
- cambiar analytics: `AnalyticsPage`, `useAnalyticsData`, `FinancesPage`
- cambiar UX de gastos: `paginas/modulos/ExpensesPage.jsx` y `componentes/gastos/*`

## 21. Resumen ejecutivo

Este frontend es un panel administrativo React para operar entidades de negocio y dashboards internos conectados a un backend `/api/admin`. Su parte mas fuerte tecnicamente esta en la combinacion de:

- `SessionContext` para bootstrap de sesion
- `moduleRepository` para integracion HTTP centralizada
- `metaConfigAdapter` para convertir metadata del backend en configuracion utilizable
- `useModuleCrud` para resolver CRUD generico con permisos, formularios y feedback

La aplicacion ya tiene una base arquitectonica buena, pero todavia conviven pantallas especializadas y enfoques heredados que seria conveniente unificar con el tiempo.
