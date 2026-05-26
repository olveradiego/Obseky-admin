import { executeCrudOperation } from "../_compartido/executeCrudOperation";

const buildExpenseUseCase = (method) => (params) =>
  executeCrudOperation({ ...params, method });

export const listExpensesUseCase = buildExpenseUseCase("GET");
export const getExpenseByIdUseCase = buildExpenseUseCase("GET");
export const createExpenseUseCase = buildExpenseUseCase("POST");
export const updateExpenseUseCase = buildExpenseUseCase("PATCH");
export const deleteExpenseUseCase = buildExpenseUseCase("DELETE");
export const bulkDeleteExpensesUseCase = buildExpenseUseCase("BULK_DELETE");
