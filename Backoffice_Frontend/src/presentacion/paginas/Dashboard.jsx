import React from "react";
import {
  LogOut,
  Users,
  Building2,
  CreditCard,
  CircleDollarSign,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

/**
 * @filePurpose Dashboard.jsx
 * @description Nueva vista principal (Dashboard) para el panel de gestión Obseky.
 * Implementa la estructura visual solicitada: Top Bar, Accesos Rápidos y Panel de Resumen.
 */
export const Dashboard = () => {
  // Lista estática de módulos para la matriz de permisos
  const modules = [
    "companies",
    "customers",
    "finalcustomers",
    "codes",
    "users",
    "expenses",
    "orders",
  ];

  // Permisos estáticos a mostrar por cada módulo
  const permissions = ["create", "read", "update", "delete"];

  // Función simulada de cierre de sesión
  const handleLogout = () => {
    console.log("Cerrando sesión...");
    // Aquí iría la lógica real de deslogueo y redirección
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 1. Barra Superior (Top Bar) */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 px-6 shadow-sm border border-gray-100 rounded-2xl">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
            Bienvenido, Usuario
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Cerrar sesión
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* 2. Menú de Accesos Rápidos (Grid Central) */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-4 px-1">
            Accesos Rápidos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card: Usuarios */}
            <button className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all focus:outline-none">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                <Users className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <span className="text-lg font-bold text-gray-700">Usuarios</span>
            </button>

            {/* Card: Compañías */}
            <button className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all focus:outline-none">
              <div className="p-4 bg-purple-50 text-purple-600 rounded-full">
                <Building2 className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <span className="text-lg font-bold text-gray-700">Compañías</span>
            </button>

            {/* Card: Tarjetas */}
            <button className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all focus:outline-none">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full">
                <CreditCard className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <span className="text-lg font-bold text-gray-700">Tarjetas</span>
            </button>

            {/* Card: Finanzas */}
            <button className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all focus:outline-none">
              <div className="p-4 bg-amber-50 text-amber-600 rounded-full">
                <CircleDollarSign className="w-10 h-10" strokeWidth={1.5} />
              </div>
              <span className="text-lg font-bold text-gray-700">Finanzas</span>
            </button>
          </div>
        </section>

        {/* 3. Panel de Resumen (Sección Inferior) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Columna Izquierda: Resumen Financiero */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 text-green-700 rounded-xl">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Resumen Financiero
              </h3>
            </div>
            
            <div className="space-y-4">
              {["Ingresos Totales", "Egresos Totales", "Balance", "Cuentas por Cobrar", "Cuentas por Pagar"].map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border-b border-gray-50 last:border-0 transition-colors">
                  <span className="text-gray-600 font-medium">{item}</span>
                  <span className="text-gray-900 font-bold text-lg">$0.00</span>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Permisos como usuario */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Permisos como usuario - Autorización
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-6 font-medium">
              Permisos del Rol / Matriz efectiva de acciones por modulo
            </p>

            <div className="space-y-3 overflow-y-auto max-h-80 pr-2 custom-scrollbar">
              {modules.map((mod) => (
                <div key={mod} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <span className="block font-bold text-gray-700 capitalize mb-3">
                    {mod}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {permissions.map((perm) => (
                      <span key={`${mod}-${perm}`} className="px-3 py-1 bg-white border border-gray-300 shadow-sm text-xs font-semibold text-gray-600 rounded-md uppercase tracking-wider">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;