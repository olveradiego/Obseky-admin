// Archivo: controllers/crudControllerFactory.js
// Proposito: controlador HTTP; transforma request/response y delega la logica de negocio.

const asyncHandler = require("../middleware/asyncHandler");
const { authorizeModuleAction } = require("../lib/authz");
const { notFoundError } = require("../lib/errorCatalog");
const {
  buildList,
  buildItem,
  buildDelete,
  buildBulkDelete,
} = require("../lib/responseBuilder");

// Funcion 'buildCrudController': construye estructura/objeto estandar para respuestas o configuracion.
const buildCrudController = ({
  moduleName,
  resourceLabel,
  useCases,
  messages = {},
  preDelete,
  preBulkDelete,
}) => {
// Funcion 'list': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
  const list = asyncHandler(async (req, res) => {
    authorizeModuleAction(req.headers.authorization, moduleName, "read");
    const items = await useCases.list();
    return res.status(200).json(buildList(items, messages.list));
  });

// Funcion 'getById': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
  const getById = asyncHandler(async (req, res) => {
    authorizeModuleAction(req.headers.authorization, moduleName, "read");
    const item = await useCases.getById(req.params.id);
    if (!item) {
      throw notFoundError(`${resourceLabel} no encontrado`);
    }
    return res.status(200).json(buildItem(item, messages.getById));
  });

// Funcion 'createOne': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
  const createOne = asyncHandler(async (req, res) => {
    authorizeModuleAction(req.headers.authorization, moduleName, "create");
    const item = await useCases.create(req.body || {});
    return res.status(201).json(buildItem(item, messages.create || `${resourceLabel} creado`));
  });

// Funcion 'updateById': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
  const updateById = asyncHandler(async (req, res) => {
    authorizeModuleAction(req.headers.authorization, moduleName, "update");
    const item = await useCases.update(req.params.id, req.body || {});
    if (!item) {
      throw notFoundError(`${resourceLabel} no encontrado`);
    }
    return res.status(200).json(buildItem(item, messages.update || `${resourceLabel} actualizado`));
  });

// Funcion 'deleteById': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
  const deleteById = asyncHandler(async (req, res) => {
    const actor = authorizeModuleAction(req.headers.authorization, moduleName, "delete");
    if (preDelete) {
      await preDelete({ actor, req });
    }
    const item = await useCases.delete(req.params.id, actor, req);
    if (!item) {
      throw notFoundError(`${resourceLabel} no encontrado`);
    }
    return res.status(200).json(buildDelete(item._id || item.id, messages.delete || `${resourceLabel} eliminado`));
  });

// Funcion 'deleteMany': encapsula una responsabilidad del modulo para mantener cohesion y reutilizacion.
  const deleteMany = asyncHandler(async (req, res) => {
    const actor = authorizeModuleAction(req.headers.authorization, moduleName, "delete");
    const ids = req.body?.ids;
    if (preBulkDelete) {
      await preBulkDelete({ actor, ids, req });
    }
    const result = await useCases.bulkDelete(ids, actor, req);
    return res
      .status(200)
      .json(buildBulkDelete(result, messages.bulkDelete || `${resourceLabel} eliminados`));
  });

  return {
    list,
    getById,
    createOne,
    updateById,
    deleteById,
    deleteMany,
  };
};

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = buildCrudController;


