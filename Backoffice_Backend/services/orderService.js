// Archivo: services/orderService.js
// Proposito: Capa de servicio para la gestión de las órdenes de venta.

const Order = require("@/models/Order");
const { ensureValidObjectId } = require("@/lib/mongoValidation");
const { notFoundError } = require("@/lib/errorCatalog");

const serializeOrder = (doc) => {
  if (!doc) return null;

  const raw = typeof doc.toObject === "function" ? doc.toObject() : doc;
  const populatedCompany = raw.companyId && typeof raw.companyId === "object" ? raw.companyId : null;
  const companyId = populatedCompany ? populatedCompany._id : raw.companyId;

  return {
    ...raw,
    _id: raw._id?.toString?.() || raw._id,
    companyId: companyId?.toString?.() || companyId || null,
    company: populatedCompany
      ? {
          _id: populatedCompany._id?.toString?.() || populatedCompany._id,
          name: populatedCompany.name || "",
          email: populatedCompany.email || "",
        }
      : null,
    companyName: populatedCompany?.name || "",
    companyEmail: populatedCompany?.email || "",
  };
};

const listOrders = async (filters = {}) => {
  const query = {};
  
  if (filters.companyId) {
    query.companyId = filters.companyId;
  }
  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }

  const orders = await Order.find(query).populate("companyId", "name email").sort({ createdAt: -1 });
  return orders.map(serializeOrder);
};

const getOrderById = async (id) => {
  ensureValidObjectId(id);
  const order = await Order.findById(id).populate("companyId", "name email");
  if (!order) {
    throw notFoundError("Orden no encontrada.");
  }
  return serializeOrder(order);
};

const updateOrderStatus = async (id, paymentStatus) => {
  ensureValidObjectId(id);
  const order = await Order.findByIdAndUpdate(
    id,
    { paymentStatus },
    { new: true, runValidators: true }
  ).populate("companyId", "name email");
  
  if (!order) {
    throw notFoundError("Orden no encontrada.");
  }
  return serializeOrder(order);
};

const deleteOrder = async (id) => {
  ensureValidObjectId(id);
  const order = await Order.findByIdAndDelete(id);
  if (!order) {
    throw notFoundError("Orden no encontrada para eliminar.");
  }
  return order;
};

module.exports = { listOrders, getOrderById, updateOrderStatus, deleteOrder };
