import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "@/presentacion/ganchos/useSession";
import { getFormattedDate } from "@/aplicacion/utilidades/dateUtils";
import { normalizeCardStats } from "@/aplicacion/utilidades/cardStatsUtils";
import { buildEndpointCatalogFromMeta } from "@/aplicacion/adaptadores/metaConfigAdapter";
import { createModuleRepository } from "@/infraestructura/repositorios/moduleRepository";
import { MODULE_KEYS } from "@/dominio/constantes/modules";
import { mergeFinancialSummaryWithExpenses } from "@/aplicacion/utilidades/financialSummaryUtils";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeText = (value) => String(value ?? "").trim().toLowerCase();

const unwrapExpense = (expense) => {
  if (expense?.item && typeof expense.item === "object") {
    return { ...expense.item, ...expense };
  }
  return expense || {};
};

const extractIdValue = (value) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    if (typeof value.$oid === "string") return value.$oid.trim();
    if (typeof value.id === "string") return value.id.trim();
    if (typeof value._id === "string") return value._id.trim();
  }
  return "";
};

const resolveMongoDate = (expense) => {
  const source = unwrapExpense(expense);
  const idCandidate =
    extractIdValue(source?.id) || extractIdValue(source?._id) || extractIdValue(expense?.item?.id);

  if (!/^[a-fA-F0-9]{24}$/.test(idCandidate)) return null;

  const timestamp = parseInt(idCandidate.slice(0, 8), 16) * 1000;
  return Number.isFinite(timestamp) ? new Date(timestamp) : null;
};

const resolveExpenseDate = (expense) => {
  const source = unwrapExpense(expense);
  const rawDate = source?.date || source?.expenseDate || source?.createdAt || source?.updatedAt || "";
  
  if (!rawDate) return resolveMongoDate(expense);
  
  const dateStr = String(rawDate).trim();
  
  // Si la fecha viene de MongoDB con T00:00:00.000Z, es un "Date-only" en UTC.
  // Lo convertimos a local eliminando la parte de tiempo para que no salte de dia por la zona horaria.
  if (dateStr.includes("T00:00:00")) {
    const onlyDate = dateStr.split("T")[0];
    return new Date(`${onlyDate}T12:00:00`);
  }

  // Si es solo una fecha YYYY-MM-DD, forzamos mediodia local
  const isOnlyDate = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  const dateToParse = isOnlyDate ? `${dateStr}T12:00:00` : rawDate;
  
  const parsed = Date.parse(dateToParse);
  if (!Number.isNaN(parsed)) return new Date(parsed);
  
  return resolveMongoDate(expense);
};

const resolveExpenseCompanyName = (expense, companyMap) => {
  const source = unwrapExpense(expense);
  const directName = source?.company?.name || source?.company?.companyName || source?.companyName || "";
  if (directName) return directName;
  const companyId = String(source?.companyId || source?.company?._id || source?.company?.id || "").trim();
  if (!companyId) return "";
  return companyMap.get(companyId) || "";
};

const matchesSelectedCompany = (expense, selectedCompany, companyMap) => {
  if (!selectedCompany || selectedCompany === "global") return true;
  return normalizeText(resolveExpenseCompanyName(expense, companyMap)) === normalizeText(selectedCompany);
};

const matchesDateRange = (expense, startDate, endDate) => {
  const expenseDate = resolveExpenseDate(expense);
  if (!expenseDate) return true;

  // Usamos comparacion de strings YYYY-MM-DD
  const year = expenseDate.getFullYear();
  const month = String(expenseDate.getMonth() + 1).padStart(2, "0");
  const day = String(expenseDate.getDate()).padStart(2, "0");
  const expenseDayStr = `${year}-${month}-${day}`;

  const startStr = startDate ? String(startDate) : "";
  const endStr = endDate ? String(endDate) : "";

  if (startStr && expenseDayStr < startStr) return false;
  if (endStr && expenseDayStr > endStr) return false;

  return true;
};

const normalizeExpensesByCategoryResponse = (payload) => {
  const items = Array.isArray(payload) ? payload : payload?.items || payload?.data || [];
  return items
    .map((item) => {
      const source = unwrapExpense(item);
      return {
        category: String(source?.category || source?.name || source?.label || "Sin categoria").trim() || "Sin categoria",
        amount: toNumber(source?.amount ?? source?.totalAmount ?? source?.total ?? source?.value ?? 0),
      };
    })
    .filter((item) => item.category && item.amount > 0);
};

const buildExpensesByCategoryFromExpenses = ({ expenses = [], companies = [], selectedCompany = "global", startDate = "", endDate = "" }) => {
  const companyMap = new Map(
    (companies || []).map((company) => [
      String(company?.id || company?._id || "").trim(),
      company?.name || company?.companyName || company?.businessName || "",
    ])
  );

  const grouped = new Map();

  for (const expense of expenses) {
    if (!matchesSelectedCompany(expense, selectedCompany, companyMap) || !matchesDateRange(expense, startDate, endDate)) continue;

    const source = unwrapExpense(expense);
    const category = String(source?.category || "Sin categoria").trim() || "Sin categoria";
    const amount = toNumber(source?.amount ?? source?.totalAmount ?? source?.total ?? 0);
    grouped.set(category, (grouped.get(category) || 0) + amount);
  }

  return Array.from(grouped.entries())
    .map(([category, amount]) => ({ category, amount }))
    .filter((item) => item.amount > 0)
    .sort((left, right) => right.amount - left.amount);
};

const buildExpensesByMonthFromExpenses = ({ expenses = [], companies = [], selectedCompany = "global", startDate = "", endDate = "" }) => {
  const companyMap = new Map(
    (companies || []).map((company) => [
      String(company?.id || company?._id || "").trim(),
      company?.name || company?.companyName || company?.businessName || "",
    ])
  );

  const grouped = new Map();

  for (const expense of expenses) {
    if (!matchesSelectedCompany(expense, selectedCompany, companyMap) || !matchesDateRange(expense, startDate, endDate)) continue;

    const source = unwrapExpense(expense);
    const expenseDate = resolveExpenseDate(expense) || new Date();
    const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, "0")}`;
    const amount = toNumber(source?.amount ?? source?.totalAmount ?? source?.total ?? 0);
    grouped.set(monthKey, (grouped.get(monthKey) || 0) + amount);
  }

  return Array.from(grouped.entries())
    .sort(([leftMonth], [rightMonth]) => leftMonth.localeCompare(rightMonth))
    .map(([month, amount]) => ({ month, amount }));
};

const buildExpensesByDayFromExpenses = ({ expenses = [], companies = [], selectedCompany = "global", startDate = "", endDate = "" }) => {
  const companyMap = new Map(
    (companies || []).map((company) => [
      String(company?.id || company?._id || "").trim(),
      company?.name || company?.companyName || company?.businessName || "",
    ])
  );

  const grouped = new Map();

  for (const expense of expenses) {
    if (!matchesSelectedCompany(expense, selectedCompany, companyMap) || !matchesDateRange(expense, startDate, endDate)) continue;

    const expenseDate = resolveExpenseDate(expense) || new Date();
    // Generar key YYYY-MM-DD en hora local para evitar saltos de zona horaria de UTC
    const year = expenseDate.getFullYear();
    const month = String(expenseDate.getMonth() + 1).padStart(2, "0");
    const day = String(expenseDate.getDate()).padStart(2, "0");
    const dayKey = `${year}-${month}-${day}`;
    
    const source = unwrapExpense(expense);
    const amount = toNumber(source?.amount ?? source?.totalAmount ?? source?.total ?? 0);
    grouped.set(dayKey, (grouped.get(dayKey) || 0) + amount);
  }

  return Array.from(grouped.entries())
    .sort(([leftDay], [rightDay]) => leftDay.localeCompare(rightDay))
    .map(([day, amount]) => ({ day, amount }));
};

const buildExpensesByMonthFallbackFromSummary = (financialSummary, referenceDate = new Date()) => {
  const totalRecordedExpenses = toNumber(
    financialSummary?.totalRecordedExpenses ?? financialSummary?.totalExpenses ?? 0
  );

  if (totalRecordedExpenses <= 0) return [];

  const monthKey = `${referenceDate.getFullYear()}-${String(referenceDate.getMonth() + 1).padStart(2, "0")}`;
  return [{ month: monthKey, amount: totalRecordedExpenses }];
};

/**
 * @filePurpose useAnalyticsData.js
 * @description Hook personalizado para gestionar la carga de datos y estados de la pagina de analiticas.
 */
export const useAnalyticsData = ({ selectedCompany, startDate, endDate }) => {
  const { token, logout, apiBase, metaConfig } = useSession();
  const [cardStats, setCardStats] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [expensesByMonth, setExpensesByMonth] = useState([]);
  const [expensesByDay, setExpensesByDay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const moduleRepository = useMemo(
    () => createModuleRepository(apiBase, buildEndpointCatalogFromMeta(metaConfig)),
    [apiBase, metaConfig]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCardStats(null);
    setFinancialSummary(null);
    setExpensesByCategory([]);
    setExpensesByMonth([]);
    setExpensesByDay([]);

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const companyFilter = selectedCompany === "global" || !selectedCompany ? "" : selectedCompany;
      const formattedStartDate = getFormattedDate(startDate);
      const formattedEndDate = getFormattedDate(endDate);

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const query = new URLSearchParams();
      if (companyFilter) query.append("companyName", companyFilter);
      if (formattedStartDate) query.append("startDate", formattedStartDate);
      if (formattedEndDate) query.append("endDate", formattedEndDate);
      const qs = query.toString();

      const cardStatsUrl = `${apiBase}/api/admin/analytics/card-stats${qs ? `?${qs}` : ""}`;
      const financialSummaryUrl = `${apiBase}/api/admin/analytics/financial-summary${qs ? `?${qs}` : ""}`;
      const expensesByCategoryUrl = `${apiBase}/api/admin/analytics/expenses-by-category${qs ? `?${qs}` : ""}`;

      const [cardStatsRes, financialSummaryRes, expensesByCategoryRes, expensesListResult, companiesListResult] = await Promise.all([
        fetch(cardStatsUrl, { headers }),
        fetch(financialSummaryUrl, { headers }),
        fetch(expensesByCategoryUrl, { headers }),
        moduleRepository.list({ moduleName: MODULE_KEYS.EXPENSES, token }),
        moduleRepository.list({ moduleName: MODULE_KEYS.COMPANIES, token }),
      ]);

      if (!cardStatsRes.ok || !financialSummaryRes.ok || !expensesByCategoryRes.ok) {
        if (cardStatsRes.status === 401 || financialSummaryRes.status === 401 || expensesByCategoryRes.status === 401) {
          setError("Tu sesion es invalida o ha expirado. Seras redirigido al login.");
          logout();
        } else {
          setError("Ocurrio un error al cargar los datos desde el servidor.");
        }
        setLoading(false);
        return;
      }

      const cardData = await cardStatsRes.json();
      const finData = await financialSummaryRes.json();
      const expData = await expensesByCategoryRes.json();
      
      const expensesItems = expensesListResult.ok 
        ? (Array.isArray(expensesListResult.data) ? expensesListResult.data : expensesListResult.data?.items || []) 
        : [];
        
      const companyItems = companiesListResult.ok 
        ? (Array.isArray(companiesListResult.data) ? companiesListResult.data : companiesListResult.data?.items || []) 
        : [];

      setCardStats({
        ...cardData,
        cardsByStatus: Array.isArray(cardData?.cardsByStatus) ? cardData.cardsByStatus : [],
        totalCards: cardData?.totalCards ?? 0,
      });

      const mergedFinancialSummary = mergeFinancialSummaryWithExpenses({
        financialSummary: {
          ...finData,
          totalRevenue: finData?.totalRevenue ?? 0,
          totalExpenses: finData?.totalExpenses ?? 0,
          balance: finData?.balance ?? 0,
          accountsReceivable: finData?.accountsReceivable ?? 0,
          accountsPayable: finData?.accountsPayable ?? 0,
        },
        expenses: expensesItems,
        companies: companyItems,
        selectedCompany: companyFilter || "global",
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      setFinancialSummary(mergedFinancialSummary);

      const normalizedExpensesByCategory = normalizeExpensesByCategoryResponse(expData);
      setExpensesByCategory(
        normalizedExpensesByCategory.length > 0
          ? normalizedExpensesByCategory
          : buildExpensesByCategoryFromExpenses({
              expenses: expensesItems,
              companies: companyItems,
              selectedCompany: companyFilter || "global",
              startDate: formattedStartDate,
              endDate: formattedEndDate,
            })
      );
      const monthlyExpenses = buildExpensesByMonthFromExpenses({
        expenses: expensesItems,
        companies: companyItems,
        selectedCompany: companyFilter || "global",
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      console.log("Calculando tendencias para:", { formattedStartDate, formattedEndDate, totalItems: expensesItems.length });

      setExpensesByMonth(
        monthlyExpenses.length > 0
          ? monthlyExpenses
          : buildExpensesByMonthFallbackFromSummary(mergedFinancialSummary)
      );

      const dayExpenses = buildExpensesByDayFromExpenses({
        expenses: expensesItems,
        companies: companyItems,
        selectedCompany: companyFilter || "global",
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      console.log("Gastos por dia filtrados:", dayExpenses);

      setExpensesByDay(dayExpenses);
    } catch (err) {
      console.error("Error al cargar los datos de analiticas:", err);
      setError("Error al cargar los datos de analiticas.");
    } finally {
      setLoading(false);
    }
  }, [selectedCompany, startDate, endDate, apiBase, token, logout, moduleRepository]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const normalizedCardsByStatus = useMemo(() => {
    if (!cardStats || !cardStats.cardsByStatus) return [];
    return normalizeCardStats(cardStats.cardsByStatus);
  }, [cardStats]);

  const totalCards = useMemo(() => cardStats?.totalCards ?? 0, [cardStats]);

  return {
    cardStats,
    financialSummary,
    expensesByCategory,
    expensesByMonth,
    expensesByDay,
    loading,
    error,
    normalizedCardsByStatus,
    totalCards,
    fetchData,
  };
};
