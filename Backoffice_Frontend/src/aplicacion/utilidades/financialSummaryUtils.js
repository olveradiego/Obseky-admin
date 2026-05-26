const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeText = (value) => String(value ?? "").trim().toLowerCase();

const resolveExpenseAmount = (expense) =>
  toNumber(expense?.amount ?? expense?.totalAmount ?? expense?.total ?? 0);

const resolveExpensePaymentStatus = (expense) => normalizeText(expense?.paymentStatus || expense?.status || "pending");

const resolveExpenseDate = (expense) => {
  const rawDate = expense?.date || expense?.expenseDate || expense?.createdAt || expense?.updatedAt || "";
  const parsed = Date.parse(rawDate);
  return Number.isNaN(parsed) ? null : new Date(parsed);
};

const resolveExpenseCompanyName = (expense, companyMap) => {
  const directName = expense?.company?.name || expense?.company?.companyName || expense?.companyName || "";
  if (directName) return directName;
  const companyId = String(expense?.companyId || expense?.company?._id || expense?.company?.id || "").trim();
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

  const startTimestamp = startDate ? Date.parse(startDate) : NaN;
  const endTimestamp = endDate ? Date.parse(endDate) : NaN;

  if (!Number.isNaN(startTimestamp) && expenseDate.getTime() < startTimestamp) return false;
  if (!Number.isNaN(endTimestamp)) {
    const inclusiveEnd = new Date(endTimestamp);
    inclusiveEnd.setHours(23, 59, 59, 999);
    if (expenseDate.getTime() > inclusiveEnd.getTime()) return false;
  }

  return true;
};

export const computeExpenseLedgerMetrics = ({
  expenses = [],
  companies = [],
  selectedCompany = "global",
  startDate = "",
  endDate = "",
}) => {
  const companyMap = new Map(
    (companies || []).map((company) => [
      String(company?.id || company?._id || "").trim(),
      company?.name || company?.companyName || company?.businessName || "",
    ])
  );

  const filteredExpenses = (expenses || []).filter(
    (expense) => matchesSelectedCompany(expense, selectedCompany, companyMap) && matchesDateRange(expense, startDate, endDate)
  );

  return filteredExpenses.reduce(
    (acc, expense) => {
      const amount = resolveExpenseAmount(expense);
      const paymentStatus = resolveExpensePaymentStatus(expense);

      acc.expenseCount += 1;
      acc.totalRecordedExpenses += amount;

      if (paymentStatus === "paid" || paymentStatus === "pagado") {
        acc.totalPaidExpenses += amount;
      } else {
        acc.totalPendingExpenses += amount;
      }

      return acc;
    },
    {
      expenseCount: 0,
      totalRecordedExpenses: 0,
      totalPaidExpenses: 0,
      totalPendingExpenses: 0,
    }
  );
};

export const mergeFinancialSummaryWithExpenses = ({
  financialSummary = {},
  expenses = [],
  companies = [],
  selectedCompany = "global",
  startDate = "",
  endDate = "",
}) => {
  const rawPaidExpenses = toNumber(financialSummary?.totalExpenses);
  const rawAccountsPayable = toNumber(financialSummary?.accountsPayable);
  const expenseMetrics = computeExpenseLedgerMetrics({
    expenses,
    companies,
    selectedCompany,
    startDate,
    endDate,
  });

  const totalPaidExpenses = expenseMetrics.totalPaidExpenses > 0 ? expenseMetrics.totalPaidExpenses : rawPaidExpenses;
  const totalPendingExpenses = expenseMetrics.totalPendingExpenses > 0 ? expenseMetrics.totalPendingExpenses : rawAccountsPayable;
  const totalRecordedExpenses = Math.max(expenseMetrics.totalRecordedExpenses, totalPaidExpenses + totalPendingExpenses);

  return {
    ...financialSummary,
    totalExpenses: totalRecordedExpenses,
    totalRecordedExpenses,
    totalPaidExpenses,
    totalPendingExpenses,
    accountsPayable: totalPendingExpenses,
  };
};
