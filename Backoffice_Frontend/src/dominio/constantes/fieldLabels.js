const FIELD_LABEL_OVERRIDES = {
  companyId: "Id de compania",
  companyName: "Compania",
  description: "Descripcion",
  amount: "Monto",
  currency: "Moneda",
  category: "Categoria",
  date: "Fecha",
  status: "Estado",
  paymentStatus: "Estado de pago",
  totalAmount: "Monto total",
  unitPrice: "Precio unitario",
  quantity: "Cantidad",
  cardQuantity: "Cantidad de tarjetas",
  orderNumber: "Numero de orden",
  orderId: "Id de orden",
  purchaseType: "Tipo de compra",
  secretCode: "Codigo secreto",
  order: "Orden",
  userName: "Usuario",
  email: "Correo",
  role: "Rol",
  businessName: "Empresa",
  customerName: "Cliente",
  contactName: "Nombre de contacto",
  orderStatus: "Estado de orden",
  name: "Nombre",
  address: "Direccion",
  zipCode: "Codigo postal",
  phone: "Telefono",
};

const FIELD_LABEL_TEXT_OVERRIDES = {
  "company id": "Id de compania",
  "company name": "Compania",
  description: "Descripcion",
  amount: "Monto",
  currency: "Moneda",
  category: "Categoria",
  date: "Fecha",
  status: "Estado",
  "payment status": "Estado de pago",
  "total amount": "Monto total",
  "unit price": "Precio unitario",
  quantity: "Cantidad",
  "card quantity": "Cantidad de tarjetas",
  "order number": "Numero de orden",
  "order id": "Id de orden",
  "purchase type": "Tipo de compra",
  "secret code": "Codigo secreto",
  order: "Orden",
  "user name": "Usuario",
  email: "Correo",
  role: "Rol",
  "business name": "Empresa",
  "customer name": "Cliente",
  "contact name": "Nombre de contacto",
  "order status": "Estado de orden",
  name: "Nombre",
  address: "Direccion",
  "zip code": "Codigo postal",
  phone: "Telefono",
};

export const humanizeFieldLabel = (value) =>
  String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const getFieldLabel = (fieldOrKey) => {
  if (typeof fieldOrKey === "string") {
    const key = fieldOrKey.trim();
    if (!key) return "";
    if (FIELD_LABEL_OVERRIDES[key]) return FIELD_LABEL_OVERRIDES[key];

    const normalizedKey = key.toLowerCase();
    if (FIELD_LABEL_TEXT_OVERRIDES[normalizedKey]) return FIELD_LABEL_TEXT_OVERRIDES[normalizedKey];

    return humanizeFieldLabel(key);
  }

  const key = String(fieldOrKey?.key || "").trim();
  const label = String(fieldOrKey?.label || "").trim();

  if (key && FIELD_LABEL_OVERRIDES[key]) return FIELD_LABEL_OVERRIDES[key];

  const normalizedLabel = label.toLowerCase();
  if (normalizedLabel && FIELD_LABEL_TEXT_OVERRIDES[normalizedLabel]) {
    return FIELD_LABEL_TEXT_OVERRIDES[normalizedLabel];
  }

  return humanizeFieldLabel(label || key);
};
