/**
 * @filePurpose modules.js
 * @description Definicion central de modulos de negocio y claves UI.
 */
import { ROLE_LABEL_BY_KEY, ROLE_KEYS, STATUS_LABEL_BY_KEY, STATUS_KEYS } from "./users";
import { CUSTOMER_DEFAULT_PAYLOAD } from "./customers";

export const MODULE_KEYS = {
  COMPANIES: "companies",
  CUSTOMERS: "customers",
  FINAL_CUSTOMERS: "finalcustomers",
  CARD_CODES: "cardcodes",
  USERS: "users",
  EXPENSES: "expenses",
  ORDERS: "orders",
};

export const MODULE_DEFINITIONS = [
  {
    key: MODULE_KEYS.COMPANIES,
    permissionKey: "companies",
    label: "Empresas",
    description: "Gestion de empresas administradas en LoginAdmin.",
    defaultPayload: '{\n  "name": "Empresa demo"\n}',
  },
  {
    key: MODULE_KEYS.CUSTOMERS,
    permissionKey: "customers",
    label: "Clientes",
    description: "Gestion de clientes corporativos.",
    defaultPayload: `${JSON.stringify(CUSTOMER_DEFAULT_PAYLOAD, null, 2)}`,
  },
  {
    key: MODULE_KEYS.FINAL_CUSTOMERS,
    permissionKey: "finalcustomers",
    label: "Clientes finales",
    description: "Gestion de clientes finales asociados.",
    defaultPayload: '{\n  "name": "Cliente final demo"\n}',
  },
  {
    key: MODULE_KEYS.CARD_CODES,
    permissionKey: "codes",
    label: "Codigos de tarjeta",
    description: "Gestion de codigos de tarjeta.",
    defaultPayload: '{\n  "name": "Codigo demo",\n  "unitPrice": 1.00\n}',
    fields: [
      { key: "name", label: "Nombre del codigo", type: "text", required: true, mutable: true },
      { key: "unitPrice", label: "Precio unitario", type: "number", required: true, mutable: true, step: "0.01", min: "0" },
    ],
  },
  {
    key: MODULE_KEYS.USERS,
    permissionKey: "users",
    label: "Usuarios",
    description: "Gestion de administradores y superadministradores.",
    defaultPayload:
      `{\n  "companyName": "Empresa Demo",\n  "userName": "Nuevo administrador",\n  "email": "nuevo.admin@empresa.com",\n  "password": "12345678",\n  "role": "${ROLE_LABEL_BY_KEY[ROLE_KEYS.ADMIN]}",\n  "status": "${STATUS_LABEL_BY_KEY[STATUS_KEYS.ACTIVO]}"\n}`,
  },
  {
    key: MODULE_KEYS.EXPENSES,
    permissionKey: "expenses",
    label: "Gastos",
    description: "Gestion de gastos operativos de las companias.",
    defaultPayload:
      '{\n  "description": "Gasto de oficina",\n  "amount": 100,\n  "currency": "MXN",\n  "paymentStatus": "pending",\n  "companyId": "ID_DE_COMPANIA",\n  "category": "Operacional",\n  "date": "YYYY-MM-DD"\n}',
    fields: [
      { key: "description", label: "Descripcion", type: "text", required: true, mutable: true },
      { key: "amount", label: "Monto", type: "number", required: true, mutable: true },
      { key: "currency", label: "Moneda", type: "enum", values: ["MXN", "ARS", "COP", "VES"], required: true, mutable: true },
      { key: "companyId", label: "Compania", type: "text", required: true, mutable: true },
      { key: "category", label: "Categoria", type: "text", required: false, mutable: true },
      { key: "date", label: "Fecha", type: "date", required: true, mutable: true },
      { key: "paymentStatus", label: "Estado de pago", type: "enum", values: ["pending", "paid"], required: true, mutable: true },
    ],
  },
  {
    key: MODULE_KEYS.ORDERS,
    permissionKey: "orders",
    label: "Ordenes de venta",
    description: "Gestion de ordenes de venta y su estado de pago.",
    defaultPayload: '{\n  "companyId": "ID_DE_COMPANIA",\n  "cardQuantity": 1,\n  "unitPrice": 1.00,\n  "totalAmount": 1.00,\n  "paymentStatus": "pending"\n}',
    fields: [
      { key: "paymentStatus", label: "Estado de pago", type: "enum", values: ["pending", "paid"], required: true, mutable: true },
    ],
  },
];

export const findModuleDefinition = (moduleKey) =>
  MODULE_DEFINITIONS.find((moduleItem) => moduleItem.key === moduleKey) || MODULE_DEFINITIONS[0];
