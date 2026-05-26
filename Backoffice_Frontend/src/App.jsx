/**
 * @filePurpose App.jsx
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./presentacion/componentes/AppLayout";
import { ProtectedRoute } from "./presentacion/componentes/ProtectedRoute";
import { SuperAdminRoute } from "./presentacion/componentes/SuperAdminRoute";
import { SessionProvider } from "./presentacion/contexto/SessionContext";
import { DashboardHomePage } from "./presentacion/paginas/DashboardHomePage";
import { LoginPage } from "./presentacion/paginas/LoginPage";
import { AnalyticsPage } from "./presentacion/paginas/AnalyticsPage";
import { FinancesPage } from "./presentacion/paginas/FinancesPage";
import { CompaniesPage } from "./presentacion/paginas/modulos/CompaniesPage";
import { CustomersPage } from "./presentacion/paginas/modulos/CustomersPage";
import { FinalCustomersPage } from "./presentacion/paginas/modulos/FinalCustomersPage";
import { OrdersPage } from "./presentacion/paginas/modulos/OrdersPage";
import { ExpensesPage } from "./presentacion/paginas/modulos/ExpensesPage";
import { UsersPage } from "./presentacion/paginas/modulos/UsersPage";
import { CardCodesPage } from "./presentacion/paginas/modulos/CardCodesPage";
import { ModuleEntityFormPage } from "./presentacion/paginas/modulos/ModuleEntityFormPage";
import { MODULE_KEYS } from "./dominio/constantes/modules";

/**
 * @function App
 * @description Ejecuta la logica asociada a 'app' y retorna su resultado.
 */
function App() {
  return (
    <SessionProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardHomePage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="finanzas" element={<FinancesPage />} />
            <Route path="finanzas/expenses/create" element={<FinancesPage />} />
            <Route path="finanzas/expenses/:id/edit" element={<FinancesPage />} />
            <Route path="finanzas/orders/create" element={<FinancesPage />} />
            <Route path="finanzas/orders/:id/edit" element={<FinancesPage />} />
            <Route path="modules/companies" element={<CompaniesPage />} />
            <Route path="modules/companies/create" element={<ModuleEntityFormPage moduleKey={MODULE_KEYS.COMPANIES} mode="create" />} />
            <Route path="modules/companies/:id/edit" element={<ModuleEntityFormPage moduleKey={MODULE_KEYS.COMPANIES} mode="edit" />} />
            <Route path="modules/customers" element={<CustomersPage />} />
            <Route path="modules/customers/create" element={<ModuleEntityFormPage moduleKey={MODULE_KEYS.CUSTOMERS} mode="create" />} />
            <Route path="modules/customers/:id/edit" element={<ModuleEntityFormPage moduleKey={MODULE_KEYS.CUSTOMERS} mode="edit" />} />
            <Route path="modules/finalcustomers" element={<FinalCustomersPage />} />
            <Route path="modules/finalcustomers/create" element={<ModuleEntityFormPage moduleKey={MODULE_KEYS.FINAL_CUSTOMERS} mode="create" />} />
            <Route path="modules/finalcustomers/:id/edit" element={<ModuleEntityFormPage moduleKey={MODULE_KEYS.FINAL_CUSTOMERS} mode="edit" />} />
            <Route path="modules/cardcodes" element={<CardCodesPage />} />
            <Route path="modules/cardcodes/create" element={<ModuleEntityFormPage moduleKey={MODULE_KEYS.CARD_CODES} mode="create" />} />
            <Route path="modules/cardcodes/:id/edit" element={<ModuleEntityFormPage moduleKey={MODULE_KEYS.CARD_CODES} mode="edit" />} />
            <Route path="modules/orders" element={<OrdersPage />} />
            <Route path="modules/orders/create" element={<ModuleEntityFormPage moduleKey={MODULE_KEYS.ORDERS} mode="create" />} />
            <Route path="modules/orders/:id/edit" element={<ModuleEntityFormPage moduleKey={MODULE_KEYS.ORDERS} mode="edit" />} />
            <Route path="modules/expenses" element={<ExpensesPage />} />
            <Route path="modules/expenses/create" element={<ModuleEntityFormPage moduleKey={MODULE_KEYS.EXPENSES} mode="create" />} />
            <Route path="modules/expenses/:id/edit" element={<ModuleEntityFormPage moduleKey={MODULE_KEYS.EXPENSES} mode="edit" />} />
            <Route element={<SuperAdminRoute />}>
              <Route path="modules/users" element={<UsersPage />} />
              <Route path="modules/users/create" element={<ModuleEntityFormPage moduleKey={MODULE_KEYS.USERS} mode="create" />} />
              <Route path="modules/users/:id/edit" element={<ModuleEntityFormPage moduleKey={MODULE_KEYS.USERS} mode="edit" />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SessionProvider>
  );
}

export default App;

