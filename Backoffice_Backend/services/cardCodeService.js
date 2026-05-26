// Archivo: services/cardCodeService.js
// Proposito: capa de servicio con reglas de negocio, validaciones y acceso a datos.

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const CardCode = require("@/models/CardCode");
const Order = require("@/models/Order");
const Company = require("@/models/Company");
const { ensureValidObjectId, ensureBulkIds } = require("@/lib/mongoValidation");
const {
  validationError,
  notFoundError,
  forbiddenError,
} = require("@/lib/errorCatalog");

// Catalogo de estados activos aceptados para validar uso de tarjetas QR.
const ACTIVE_STATUS_VALUES = ["activo", "active"];
// URL base del frontend para construir la ruta que se codifica en el QR.
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
// Directorio donde se persisten archivos PDF generados para lotes de tarjetas.
const QR_CARDS_OUTPUT_DIR = path.join(__dirname, "..", "uploadsQRCards");
// Plantilla de fondo para imprimir tarjetas con QR (mismo arte que tarjetasDigitalesBackend).
const QR_CARD_TEMPLATE_PATH = path.join(__dirname, "..", "images", "card3.jpg");
// Catalogo de prefijos para ordenes y randomCode.
const ORDER_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Funcion 'assertObjectPayload': valida precondiciones de entrada y lanza errores de contrato cuando corresponde.
const assertObjectPayload = (payload, mode) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw validationError("payload invalido", { mode });
  }
  if (mode === "update" && Object.keys(payload).length === 0) {
    throw validationError("payload vacio", { mode });
  }
};

// Funcion 'generateNumericCode': genera una cadena numerica de longitud fija para folios/codigos.
const generateNumericCode = (length) => {
  const max = Math.pow(10, length);
  const num = Math.floor(Math.random() * max);
  return String(num).padStart(length, "0");
};

// Funcion 'parseOrder': parsea un folio con formato L-###### y devuelve sus partes numericas.
const parseOrder = (value) => {
  const normalized = String(value || "").trim();
  const parts = normalized.split("-");
  if (parts.length !== 2) return null;
  const letter = parts[0];
  const number = Number.parseInt(parts[1], 10);
  if (!ORDER_LETTERS.includes(letter) || !Number.isInteger(number) || number <= 0) return null;
  return { letter, number };
};

// Funcion 'parsePurchaseType': convierte y valida valores de entrada a boolean para el campo purchaseType.
const parsePurchaseType = (value, { allowUndefined = false, defaultValue = false } = {}) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    if (allowUndefined) return defaultValue;
    throw validationError("purchaseType debe ser booleano", {
      field: "purchaseType",
      reason: "purchaseType must be boolean",
      value,
    });
  }

  if (typeof value === "boolean") return value;

  const normalized = String(value).trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;

  throw validationError("purchaseType debe ser booleano", {
    field: "purchaseType",
    reason: "purchaseType must be boolean",
    value,
  });
};

// Funcion 'buildQrPayload': construye la URL final que se codifica dentro del QR.
// El frontend de tarjetas espera recibir el _id real de mongo en la ruta /index/:id
const buildQrPayload = (id, overrideBaseUrl) => `${overrideBaseUrl || FRONTEND_BASE_URL}/index/${id}`;

// Funcion 'qrDataUrlToBuffer': transforma DataURL de QR a Buffer binario para insertar en PDF.
const qrDataUrlToBuffer = (dataUrl) => {
  const base64 = String(dataUrl).replace(/^data:image\/png;base64,/, "");
  return Buffer.from(base64, "base64");
};

// Funcion 'normalizeGenerationParams': valida numCodes/num y normaliza los parametros de generacion.
const normalizeGenerationParams = ({ total, purchaseType, allowUndefinedPurchaseType = false }) => {
  const parsedTotal = Number(total);
  if (!Number.isFinite(parsedTotal) || parsedTotal <= 0 || !Number.isInteger(parsedTotal)) {
    throw validationError("numCodes/num debe ser un numero mayor a 0", {
      field: "numCodes",
      reason: "numCodes/num must be a positive integer",
      value: total,
    });
  }

  return {
    total: parsedTotal,
    purchaseType: parsePurchaseType(purchaseType, {
      allowUndefined: allowUndefinedPurchaseType,
      defaultValue: true,
    }),
  };
};

// Funcion 'resolveLastOrderState': obtiene el ultimo folio y prepara el siguiente consecutivo.
const resolveLastOrderState = async () => {
  const last = await CardCode.findOne({}).sort({ _id: -1 }).select("order").lean();
  const parsed = parseOrder(last?.order);
  if (!parsed) {
    return { letterIndex: 0, consecutive: 0 };
  }
  const letterIndex = ORDER_LETTERS.indexOf(parsed.letter);
  if (letterIndex < 0) return { letterIndex: 0, consecutive: 0 };
  return { letterIndex, consecutive: parsed.number };
};

// Funcion 'nextOrder': retorna el siguiente folio secuencial con rollover en 999999.
const nextOrder = (state) => {
  let { letterIndex, consecutive } = state;
  if (consecutive >= 999999) {
    letterIndex += 1;
    if (letterIndex >= ORDER_LETTERS.length) {
      throw validationError("No hay letras disponibles para generar mas folios", {
        field: "order",
        reason: "order letters exhausted",
      });
    }
    consecutive = 1;
  } else {
    consecutive += 1;
  }

  return {
    order: `${ORDER_LETTERS[letterIndex]}-${String(consecutive).padStart(6, "0")}`,
    state: { letterIndex, consecutive },
  };
};

// Funcion 'generateUniqueRandomCodes': genera randomCode unicos con formato L-######.
const generateUniqueRandomCodes = async (count) => {
  const generated = new Set();
  while (generated.size < count) {
    const letter = ORDER_LETTERS[Math.floor(Math.random() * ORDER_LETTERS.length)];
    const number = String(Math.floor(Math.random() * 999999) + 1).padStart(6, "0");
    generated.add(`${letter}-${number}`);
  }

  const batch = Array.from(generated);
  const existing = await CardCode.find({ randomCode: { $in: batch } }).select("randomCode").lean();
  const existingSet = new Set(existing.map((item) => String(item.randomCode || "")));
  const filtered = batch.filter((code) => !existingSet.has(code));

  if (filtered.length >= count) return filtered.slice(0, count);
  const missing = await generateUniqueRandomCodes(count - filtered.length);
  return filtered.concat(missing);
};

// Funcion 'list': lista registros de la entidad/modulo y prepara datos para respuesta.
const list = async () => CardCode.find({}).sort({ createdAt: -1 });

// Funcion 'getById': obtiene un registro por identificador y permite control de existencia/errores.
const getById = async (id) => {
  ensureValidObjectId(id);
  return CardCode.findById(id);
};

// Funcion 'createOne': crea un registro nuevo aplicando reglas/validaciones del flujo.
const createOne = async (payload) => {
  assertObjectPayload(payload, "create");
  return CardCode.create(payload);
};

// Funcion 'updateById': actualiza un registro existente segun id y payload permitido.
const updateById = async (id, payload) => {
  ensureValidObjectId(id);
  assertObjectPayload(payload, "update");
  return CardCode.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
};

// Funcion 'deleteById': elimina registros (individual o masivo) segun reglas de negocio.
const deleteById = async (id) => {
  ensureValidObjectId(id);
  return CardCode.findByIdAndDelete(id);
};

// Funcion 'bulkDeleteByIds': elimina varios registros por ids y devuelve resumen de resultados.
const bulkDeleteByIds = async (ids) => {
  const uniqueIds = ensureBulkIds(ids);
  const foundDocs = await CardCode.find({ _id: { $in: uniqueIds } }).select("_id");
  const foundIds = foundDocs.map((doc) => String(doc._id));
  const foundSet = new Set(foundIds);
  const notFoundIds = uniqueIds.filter((id) => !foundSet.has(id));

  if (foundIds.length > 0) {
    await CardCode.deleteMany({ _id: { $in: foundIds } });
  }

  return {
    requestedCount: uniqueIds.length,
    deletedCount: foundIds.length,
    deletedIds: foundIds,
    notFoundCount: notFoundIds.length,
    notFoundIds,
  };
};

// Funcion 'generateCodesWithQr': crea codigos en DB y retorna el QR en memoria para cada elemento creado.
const generateCodesWithQr = async ({ numCodes, purchaseType, companyId, orderNumber = "", unitPrice = 0, frontendBaseUrl }) => {
  const normalized = normalizeGenerationParams({
    total: numCodes,
    purchaseType,
  });
  let orderState = await resolveLastOrderState();
  const randomCodes = await generateUniqueRandomCodes(normalized.total);

  let company = null;
  if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
    company = await Company.findById(companyId);
  }
  if (!company) {
    throw validationError(`No se encontró la compañía seleccionada en la base de datos. Se requiere para asociar la orden financiera.`);
  }

  const numericUnitPrice = Number(unitPrice) > 0 ? Number(unitPrice) : 0;
  const batchOrderNumber = String(orderNumber || "").trim() || `LOTE-${Date.now()}`;

  // 1. Crear la orden financiera de la venta PRIMERO
  const newOrder = await Order.create({
    companyId: company._id,
    orderNumber: batchOrderNumber,
    quantity: normalized.total,
    unitPrice: numericUnitPrice,
    totalAmount: numericUnitPrice * normalized.total,
    paymentStatus: "pending",
  });

  const createdItems = [];
  for (let x = 0; x < normalized.total; x++) {
    const objectId = new mongoose.Types.ObjectId();
    const id = String(objectId);
    const qrPayload = buildQrPayload(id, frontendBaseUrl);
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 500, margin: 1 });
    const next = nextOrder(orderState);
    orderState = next.state;
    const docData = {
      _id: objectId,
      purchaseType: normalized.purchaseType,
      secretCode: generateNumericCode(6),
      order: next.order,
      randomCode: randomCodes[x],
      companyId: company._id,
      orderId: newOrder._id,
      companyName: company.name, // Mantenido temporalmente para no romper cosas viejas
      orderNumber: newOrder.orderNumber,
      status: "Activo",
    };
    const saved = await CardCode.create(docData);

    createdItems.push({
      _id: String(saved._id),
      id: String(saved._id),
      order: saved.order,
      secretCode: saved.secretCode,
      purchaseType: saved.purchaseType,
      randomCode: saved.randomCode,
      status: saved.status,
      companyName: saved.companyName || "",
      orderNumber: saved.orderNumber || "",
      createdAt: saved.createdAt,
      qrPayload,
      qrDataUrl,
    });
  }

  return createdItems;
};

// Funcion 'generateCodesPdf': genera codigos, construye un PDF con sus QR y lo guarda en disco.
const generateCodesPdf = async ({ num, purchaseType, companyId, orderNumber = "", unitPrice = 0, designId, frontendBaseUrl, pdfFormat = "backs" }) => {
  const normalized = normalizeGenerationParams({
    total: num,
    purchaseType,
    allowUndefinedPurchaseType: true,
  });
  const designsMap = {
    "diseño_1": {
      front: path.join(__dirname, "..", "images", "diseño_1_frente.png"),
      back: path.join(__dirname, "..", "images", "diseño_1_trasero.png"),
      qrConfig: { size: 82, deltaX: 127, deltaY: 43 },
      folioConfig: { deltaX: 17, deltaY: 95, color: "#55575a" }
    },
    "diseño_2": {
      front: path.join(__dirname, "..", "images", "diseño_2_frente.png"),
      back: path.join(__dirname, "..", "images", "diseño_2_trasero.png"),
      qrConfig: { size: 82, deltaX: 126, deltaY: 39, colorDark: "#FFFFFF", colorLight: "#00000000" },
      folioConfig: { deltaX: 17, deltaY: 95, color: "#ffffff" }
    },
    "diseño_3": {
      front: path.join(__dirname, "..", "images", "diseño_3_frente.png"),
      back: path.join(__dirname, "..", "images", "diseño_3_trasero.png"),
      qrConfig: { size: 65, deltaX: 150, deltaY: 47 },
      folioConfig: { deltaX: 158, deltaY: 125, color: "#55575a" }
    }
  };

  const selectedDesign = designsMap[designId] || designsMap["diseño_1"];

  if (!fs.existsSync(selectedDesign.back)) {
    throw validationError("No se encontro la plantilla para generar el PDF", {
      field: "template",
      expectedPath: QR_CARD_TEMPLATE_PATH,
    });
  }

  const filename = `cards-${normalized.total}-${Date.now()}.pdf`;
  const doc = new PDFDocument({ bufferPage: true, autoFirstPage: false });
  const chunks = [];
  let orderState = await resolveLastOrderState();
  const randomCodes = await generateUniqueRandomCodes(normalized.total);

  let company = null;
  if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
    company = await Company.findById(companyId);
  }
  if (!company) {
    throw validationError(`No se encontró la compañía seleccionada en la base de datos. Se requiere para asociar la orden financiera.`);
  }

  const numericUnitPrice = Number(unitPrice) > 0 ? Number(unitPrice) : 0;
  const batchOrderNumber = String(orderNumber || "").trim() || `LOTE-${Date.now()}`;

  // Solo creamos la orden si NO es "solo frentes"
  let newOrder = null;
  if (pdfFormat !== "fronts") {
    newOrder = await Order.create({
      companyId: company._id,
      orderNumber: batchOrderNumber,
      quantity: normalized.total,
      unitPrice: numericUnitPrice,
      totalAmount: numericUnitPrice * normalized.total,
      paymentStatus: "pending",
    });
  }

  doc.on("data", (chunk) => chunks.push(chunk));
  const endPromise = new Promise((resolve) => doc.on("end", resolve));

  // Replicamos layout B3 de tarjetasDigitalesBackend.
  doc.fontSize(7);
  doc.font("Helvetica-Bold");
  const imageWidth = 242.65;
  const imageHeight = 153;

  // Helper para dibujar una pagina de frentes
  const drawSinglePageOfFronts = (count) => {
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const currentPosX = 25 + row * (150.5 + 2.83);
      const currentPosY = 69 + col * (241.2 + 2.83);
      doc.image(selectedDesign.front, currentPosY, currentPosX, { width: imageWidth, height: imageHeight });
    }
  };

  if (pdfFormat === "fronts") {
    // CASO: SOLO FRENTES (No toca base de datos)
    let remaining = normalized.total;
    while (remaining > 0) {
      doc.addPage({ margins: { top: 5, left: 10, right: 10, bottom: 5 }, layout: "landscape", size: "B3" });
      const cardsOnThisPage = Math.min(30, remaining);
      drawSinglePageOfFronts(cardsOnThisPage);
      remaining -= cardsOnThisPage;
    }
  } else {
    // CASO: TRASERAS O INTERCALADO
    let posX = 25;
    let posY = 69;
    let index = 0;
    let counter = 0;
    let firstGeneratedOrder = "";

    // Si es intercalado, la primera pagina debe ser de frentes
    if (pdfFormat === "interleaved") {
      doc.addPage({ margins: { top: 5, left: 10, right: 10, bottom: 5 }, layout: "landscape", size: "B3" });
      drawSinglePageOfFronts(Math.min(30, normalized.total));
    }

    // Pagina para las traseras iniciales
    doc.addPage({ margins: { top: 5, left: 10, right: 10, bottom: 5 }, layout: "landscape", size: "B3" });

    for (let x = 0; x < normalized.total; x++) {
      const objectId = new mongoose.Types.ObjectId();
      const id = String(objectId);
      const qrPayload = buildQrPayload(id, frontendBaseUrl);
      const qrColorDark = selectedDesign.qrConfig.colorDark || '#000000';
      const qrColorLight = selectedDesign.qrConfig.colorLight || '#ffffff';
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 500,
        margin: 1,
        color: {
          dark: qrColorDark,
          light: qrColorLight
        }
      });
      const qrBuffer = qrDataUrlToBuffer(qrDataUrl);
      const next = nextOrder(orderState);
      if (x === 0) firstGeneratedOrder = next.order;
      orderState = next.state;
      const docData = {
        _id: objectId,
        purchaseType: normalized.purchaseType,
        secretCode: generateNumericCode(6),
        order: next.order,
        randomCode: randomCodes[x],
        companyId: company._id,
        orderId: newOrder._id,
        companyName: company.name,
        orderNumber: newOrder ? newOrder.orderNumber : "FRONT-ONLY",
        status: "Activo",
      };
      const saved = await CardCode.create(docData);

      if (index === 30) {
        posX = 25;
        posY = 69;
        index = 0;
        counter = 0;

        // Si es intercalado, antes de la sig pagina de traseras, va una de frentes
        if (pdfFormat === "interleaved" && x < normalized.total) {
          doc.addPage({ margins: { top: 5, left: 10, right: 10, bottom: 5 }, layout: "landscape", size: "B3" });
          drawSinglePageOfFronts(Math.min(30, normalized.total - x));
        }

        doc.addPage({
          margins: { top: 5, left: 10, right: 10, bottom: 5 },
          layout: "landscape",
          size: "B3",
        });
      }

      if (counter >= 1 && counter < 5) {
        posY += 241.2 + 2.83;
      }
      if (counter === 5) {
        posX += 150.5 + 2.83;
        posY = 69;
        counter = 0;
      }

      doc.image(selectedDesign.back, posY, posX, { width: imageWidth, height: imageHeight });

      const finalQRY = posY + selectedDesign.qrConfig.deltaX;
      const finalQRX = posX + selectedDesign.qrConfig.deltaY;
      doc.image(qrBuffer, finalQRY, finalQRX, { width: selectedDesign.qrConfig.size, height: selectedDesign.qrConfig.size, align: "center" });

      const finalFolioX = posY + (selectedDesign.folioConfig?.deltaX || 26);
      const finalFolioY = posX + (selectedDesign.folioConfig?.deltaY || 118);
      const folioColor = selectedDesign.folioConfig?.color || "#55575a";

      doc.fillColor(folioColor).text(`Folio: ${saved.randomCode}`, finalFolioX, finalFolioY);

      index += 1;
      counter += 1;
    }
  }

  doc.end();
  await endPromise;
  const pdfBuffer = Buffer.concat(chunks);

  const storageService = require("./storageService");
  await storageService.saveFile(filename, pdfBuffer);

  return {
    filename,
    buffer: pdfBuffer,
    contentType: "application/pdf",
  };
};

// Funcion 'validateActiveCode': valida que la tarjeta exista y este en estado activo.
const validateActiveCode = async (id) => {
  ensureValidObjectId(id);
  const card = await CardCode.findById(id);
  if (!card) {
    throw notFoundError("La tarjeta no existe.");
  }

  const normalizedStatus = String(card.status || "").trim().toLowerCase();
  if (!ACTIVE_STATUS_VALUES.includes(normalizedStatus)) {
    throw forbiddenError("La tarjeta esta inactiva.");
  }

  return card;
};

// Exportacion del modulo para ser consumido por otras capas del backend.
module.exports = {
  list,
  getById,
  createOne,
  updateById,
  deleteById,
  bulkDeleteByIds,
  generateCodesWithQr,
  generateCodesPdf,
  validateActiveCode,
};
