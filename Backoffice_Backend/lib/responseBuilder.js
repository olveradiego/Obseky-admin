// Archivo: lib/responseBuilder.js
// Proposito: utilidades transversales reutilizables (errores, authz, validaciones, respuestas).

// Funcion 'buildList': construye estructura/objeto estandar para respuestas o configuracion.
const buildList = (items, message) => {
  const payload = { items, total: Array.isArray(items) ? items.length : 0 };
  if (message) payload.message = message;
  return payload;
};

// Funcion 'buildItem': construye estructura/objeto estandar para respuestas o configuracion.
const buildItem = (item, message) => {
  const payload = { item };
  if (message) payload.message = message;
  return payload;
};

// Funcion 'buildDelete': construye estructura/objeto estandar para respuestas o configuracion.
const buildDelete = (id, message) => ({
  item: { id: String(id) },
  message,
});

// Funcion 'buildBulkDelete': construye estructura/objeto estandar para respuestas o configuracion.
const buildBulkDelete = (result, message) => ({
  item: { ids: result.deletedIds || [] },
  message,
  requestedCount: result.requestedCount || 0,
  deletedCount: result.deletedCount || 0,
  deletedIds: result.deletedIds || [],
  notFoundCount: result.notFoundCount || 0,
  notFoundIds: result.notFoundIds || [],
});

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = {
  buildList,
  buildItem,
  buildDelete,
  buildBulkDelete,
};


