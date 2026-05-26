/**
 * @filePurpose cardStatsUtils.js
 * @description Funciones utilitarias para el manejo de estadisticas de tarjetas.
 */

export const getStatusColor = (status) => {
  const normalizedStatus = String(status || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  switch (normalizedStatus) {
    case "activo":
    case "active":
      return "#60a5fa";
    case "usado":
    case "used":
    case "en uso":
      return "#f59e0b";
    case "inactivo":
    case "inactive":
      return "#ef4444";
    case "en almacen":
    case "en almacã©n":
    case "in stock":
      return "#15803d";
    case "vendido":
      return "#5b21b6";
    default:
      return "#6b7280";
  }
};

export const ALL_CARD_STATUSES_ORDERED = [
  { key: "en uso", display: "En Uso" },
  { key: "inactivo", display: "Inactivo" },
  { key: "vendido", display: "Vendido" },
  { key: "en almacen", display: "En Almacen" },
];

export const normalizeCardStats = (apiCardsByStatus = []) => {
  const tempApiCounts = {};

  apiCardsByStatus.forEach((apiItem) => {
    const status = String(apiItem.status || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const count = Number.isFinite(apiItem.count) ? apiItem.count : 0;
    if (!status || count === 0) return;

    const key = {
      active: "activo",
      activo: "activo",
      "in stock": "activo",
      "en almacen": "activo",
      "en almacã©n": "activo",
      used: "en uso",
      "en uso": "en uso",
      inactive: "inactivo",
      inactivo: "inactivo",
      creado: "creado",
      visto: "visto",
    }[status] || status;

    tempApiCounts[key] = (tempApiCounts[key] || 0) + count;
  });

  const totalCards = Object.values(tempApiCounts).reduce((sum, count) => sum + count, 0);

  const enAlmacen = tempApiCounts.activo || 0;
  const enUsoReal = tempApiCounts["en uso"] || 0;
  const inactivas = tempApiCounts.inactivo || 0;
  const creadas = tempApiCounts.creado || 0;
  const vistas = tempApiCounts.visto || 0;

  const vendido = enUsoReal + inactivas + creadas + vistas;
  const enUsoKpi = enUsoReal + creadas + vistas;

  const finalCounts = {
    "en almacen": enAlmacen,
    "en uso": enUsoKpi,
    inactivo: inactivas,
    vendido,
  };

  const activeKpiCount = totalCards - inactivas;

  const finalResult = ALL_CARD_STATUSES_ORDERED.map((statusDef) => ({
    status: statusDef.display,
    count: finalCounts[statusDef.key] || 0,
  }));

  finalResult.push({
    status: "Activo",
    count: activeKpiCount,
  });

  return finalResult;
};
