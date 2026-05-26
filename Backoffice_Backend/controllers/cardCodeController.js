// Archivo: controllers/cardCodeController.js
// Proposito: controlador HTTP; transforma request/response y delega la logica de negocio.

const buildCrudController = require("./crudControllerFactory");
const asyncHandler = require("../middleware/asyncHandler");
const { authorizeModuleAction } = require("../lib/authz");
const { buildList, buildItem } = require("../lib/responseBuilder");
const { MODULES } = require("../services/rolePermissionService");
const listCodes = require("../application/use-cases/codes/listCodes");
const getCodeById = require("../application/use-cases/codes/getCodeById");
const createCode = require("../application/use-cases/codes/createCode");
const updateCode = require("../application/use-cases/codes/updateCode");
const deleteCode = require("../application/use-cases/codes/deleteCode");
const bulkDeleteCodes = require("../application/use-cases/codes/bulkDeleteCodes");
const generateCodesQr = require("../application/use-cases/codes/generateCodesQr");
const generateCodesPdf = require("../application/use-cases/codes/generateCodesPdf");
const validateCodeCard = require("../application/use-cases/codes/validateCodeCard");

// Funcion 'controller': construye el controlador base CRUD para el recurso codes.
const controller = buildCrudController({
  moduleName: MODULES.CODES,
  resourceLabel: "Code",
  useCases: {
    list: listCodes,
    getById: getCodeById,
    create: createCode,
    update: updateCode,
    delete: deleteCode,
    bulkDelete: bulkDeleteCodes,
  },
  messages: {
    create: "Code creado",
    update: "Code actualizado",
    delete: "Code eliminado",
    bulkDelete: "Codes eliminados",
  },
});

// Funcion 'generateQrCodes': maneja una solicitud HTTP y coordina la respuesta del endpoint.
controller.generateQrCodes = asyncHandler(async (req, res) => {
  authorizeModuleAction(req.headers.authorization, MODULES.CODES, "create");
  const items = await generateCodesQr({
    numCodes: req.params.numCodes,
    purchaseType: req.params.purchaseType,
    companyName: req.body?.companyName,
    orderNumber: req.body?.orderNumber,
    unitPrice: req.body?.unitPrice,
    frontendBaseUrl: req.body?.frontendBaseUrl,
  });
  return res.status(201).json(buildList(items, "Codes QR generados"));
});

// Funcion 'downloadCodesPdf': maneja una solicitud HTTP y coordina la respuesta del endpoint.
controller.downloadCodesPdf = asyncHandler(async (req, res) => {
  authorizeModuleAction(req.headers.authorization, MODULES.CODES, "create");
  const file = await generateCodesPdf({
    num: req.params.num,
    purchaseType: req.query?.purchaseType,
    companyName: req.query?.companyName,
    orderNumber: req.query?.orderNumber,
    unitPrice: req.query?.unitPrice,
    frontendBaseUrl: req.query?.frontendBaseUrl,
  });

  res.setHeader("Content-Type", file.contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
  return res.status(200).send(file.buffer);
});

// Funcion 'validateCard': maneja una solicitud HTTP y coordina la respuesta del endpoint.
controller.validateCard = asyncHandler(async (req, res) => {
  authorizeModuleAction(req.headers.authorization, MODULES.CODES, "read");
  const item = await validateCodeCard(req.params.id);
  return res.status(200).json(buildItem(item, "OK"));
});

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = controller;
