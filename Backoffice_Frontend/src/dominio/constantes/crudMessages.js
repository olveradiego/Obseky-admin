/**
 * @filePurpose crudMessages.js
 * @description Mensajes de feedback centralizados para operaciones CRUD.
 */
export const CRUD_NOTICE_MESSAGES = {
  permissionDenied: (method, moduleName) => `No tienes permiso para ${method} en ${moduleName}.`,
  listLoaded: "Listado cargado correctamente.",
  detailLoaded: "Registro obtenido correctamente.",
  createSuccess: "Registro creado correctamente.",
  updateSuccess: "Registro actualizado correctamente.",
  deleteSuccess: "Registro eliminado correctamente.",
  bulkComplete: "Eliminacion masiva completada.",
  bulkSelectionRequired: "Debes seleccionar al menos un registro.",
  operationFailed: "La operacion no se completo.",
  bulkFailed: "La eliminacion masiva no se completo.",
  deleteConfirm: "Esta accion eliminara el registro. Deseas continuar?",
  bulkDeleteConfirm: (count) => `Se eliminaran ${count} registros. Deseas continuar?`,
  bulkSummary: ({ message, deletedCount, notFoundCount }) =>
    `${message} Eliminados: ${deletedCount} | No encontrados: ${notFoundCount}`,
};

