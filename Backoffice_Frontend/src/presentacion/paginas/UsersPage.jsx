import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "@/presentacion/ganchos/useSession";
import { createModuleRepository } from "@/infraestructura/repositorios/moduleRepository";
import { buildEndpointCatalogFromMeta } from "@/aplicacion/adaptadores/metaConfigAdapter";
import { MODULE_KEYS } from "@/dominio/constantes/modules";
import { useModuleCrud } from "@/presentacion/ganchos/useModuleCrud";
import { 
  UserCircle, 
  Search, 
  RefreshCw, 
  Trash2, 
  Plus,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

/**
 * @filePurpose UsersPage.jsx
 * @description Vista personalizada para la gestión de Usuarios, refactorizada para usar 
 * el hook estándar useModuleCrud manteniendo el layout visual.
 */
export const UsersPage = () => {
  const { apiBase, token, metaConfig, profile } = useSession();
  
  // Estados de interfaz y combos dinámicos
  const [companies, setCompanies] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState(null);
  const [isConsulting, setIsConsulting] = useState(false);

  // Instancia del hook estandarizado
  const crud = useModuleCrud({
    apiBase,
    moduleName: MODULE_KEYS.USERS,
    token,
    permissions: profile?.permissions,
    role: profile?.role,
    metaConfig,
  });

  // Repositorio para cargar compañías manualmente para el select
  const companyRepository = useMemo(
    () => createModuleRepository(apiBase, buildEndpointCatalogFromMeta(metaConfig)),
    [apiBase, metaConfig]
  );

  useEffect(() => {
    // Carga inicial
    crud.run("GET_LIST");
    
    // Cargar compañías para el combo
    companyRepository.list({ moduleName: MODULE_KEYS.COMPANIES, token })
      .then(res => {
        if (res.ok) {
          const cData = res.data;
          setCompanies(Array.isArray(cData) ? cData : (cData?.data || cData?.docs || cData?.items || []));
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincronizar formulario con selección
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    // Usamos populateForm del hook para sincronizar el estado
    crud.populateForm({
      userName: user.userName || user.name || "",
      companyName: user.companyName || "",
      email: user.email || "",
      password: "", // Vacío por seguridad
      status: user.status || "Active",
      role: user.role || "ADMIN"
    }, "PATCH");
  };

  const handleClear = () => {
    setSelectedUser(null);
    crud.resetForm("CREATE");
    setFilteredUsers(null);
    setIsConsulting(false);
  };

  const handleCreate = async () => {
    const res = await crud.run("CREATE", { payload: crud.moduleFormData });
    if (res?.ok) {
      handleClear();
      crud.run("GET_LIST");
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    const id = selectedUser._id || selectedUser.id || selectedUser.__rowId;
    
    const payloadToUpdate = { ...crud.moduleFormData };
    if (!payloadToUpdate.password) delete payloadToUpdate.password;

    const res = await crud.run("PATCH", { id, payload: payloadToUpdate });
    if (res?.ok) {
      handleClear();
      crud.run("GET_LIST");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    const id = selectedUser._id || selectedUser.id || selectedUser.__rowId;
    if (!window.confirm(`¿Estás seguro de eliminar al usuario ${crud.moduleFormData.userName}?`)) return;
    
    const res = await crud.run("DELETE", { id });
    if (res?.ok) {
      handleClear();
      crud.run("GET_LIST");
    }
  };

  const handleConsultar = () => {
    const { userName, email, companyName } = crud.moduleFormData;
    
    if (!userName && !email && !companyName) {
      setFilteredUsers(null);
      setIsConsulting(false);
      crud.run("GET_LIST");
      return;
    }

    setIsConsulting(true);
    let matches = [...crud.allListItems];

    if (email) {
      matches = matches.filter(u => u.email?.toLowerCase().includes(email.toLowerCase()));
    } else if (userName) {
      matches = matches.filter(u => (u.userName || u.name || '').toLowerCase().includes(userName.toLowerCase()));
    }

    if (companyName) {
      matches = matches.filter(u => (u.companyName || '') === companyName);
    }

    setFilteredUsers(matches);
    crud.setCurrentPage(1);

    if ((email || userName) && matches.length > 0) {
      handleSelectUser(matches[0]);
    } else if (matches.length === 0) {
      alert("No se encontraron usuarios con esos criterios.");
    }
  };

  const activeUsers = isConsulting && filteredUsers !== null ? filteredUsers : crud.allListItems;
  const safeUsers = Array.isArray(activeUsers) ? activeUsers : [];
  
  // Paginación manual para filtros
  const itemsPerPage = crud.pageSize;
  const totalPages = isConsulting ? Math.ceil(safeUsers.length / itemsPerPage) : crud.totalPages;
  const currentUsers = isConsulting 
    ? safeUsers.slice((crud.currentPage - 1) * itemsPerPage, crud.currentPage * itemsPerPage)
    : crud.listItems;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* NOTIFICACIONES DEL HOOK */}
        {crud.notice?.message && (
          <div className={`p-4 rounded-xl border ${crud.notice.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
            {crud.notice.message}
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-8">
          
          <div className="shrink-0 flex flex-col items-center justify-center lg:w-48 bg-indigo-50/50 rounded-xl p-4 border border-indigo-50">
            <UserCircle className="w-28 h-28 text-indigo-300 mb-2" strokeWidth={1} />
            <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
              Perfil
            </span>
          </div>

          <div className="grow flex flex-col justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Nombre Completo</label>
                <input type="text" value={crud.moduleFormData.userName || ""} onChange={(e) => crud.onModuleFormFieldChange("userName", e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="Ej. Juan Pérez" />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Compañía</label>
                <select value={crud.moduleFormData.companyName || ""} onChange={(e) => crud.onModuleFormFieldChange("companyName", e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all">
                  <option value="">Selecciona una compañía...</option>
                  {companies.map(company => (
                    <option key={company._id || company.id} value={company.name || company.companyName}>
                      {company.name || company.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                <input type="email" value={crud.moduleFormData.email || ""} onChange={(e) => crud.onModuleFormFieldChange("email", e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder="correo@empresa.com" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Contraseña</label>
                <input type="password" value={crud.moduleFormData.password || ""} onChange={(e) => crud.onModuleFormFieldChange("password", e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all" placeholder={selectedUser ? "•••••••• (Dejar vacío para no cambiar)" : "Mínimo 8 caracteres"} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                <select value={crud.moduleFormData.status || "Active"} onChange={(e) => crud.onModuleFormFieldChange("status", e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all">
                  <option value="Active">Activo</option>
                  <option value="Inactive">Inactivo</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Rol</label>
                <select value={crud.moduleFormData.role || "ADMIN"} onChange={(e) => crud.onModuleFormFieldChange("role", e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all">
                  <option value="ADMIN">Administrador</option>
                  <option value="SUPER_ADMIN">Super Administrador</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-3">
              <button onClick={handleCreate} disabled={crud.loading || selectedUser} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all ${selectedUser ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200'}`}>
                <Plus className="w-5 h-5" /> Crear Usuario
              </button>
              {selectedUser && (
                <button onClick={handleClear} className="text-sm text-gray-500 hover:text-gray-700 underline">
                  Cancelar selección
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:w-48 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-6 justify-center">
            <button onClick={handleConsultar} className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm">
              <Search className="w-4 h-4 text-gray-500" /> Consultar
            </button>
            <button onClick={handleUpdate} disabled={!selectedUser || crud.loading} className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
            <button onClick={handleDelete} disabled={!selectedUser || crud.loading} className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <Trash2 className="w-4 h-4" /> Eliminar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Directorio de Usuarios</h3>
            {crud.loading && <span className="text-xs text-indigo-500 animate-pulse font-medium">Sincronizando...</span>}
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-100 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="bg-white border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th className="p-4 font-semibold">Nombre / Usuario</th>
                  <th className="p-4 font-semibold">Compañía</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Rol</th>
                  <th className="p-4 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentUsers.length > 0 ? currentUsers.map((user) => (
                  <tr key={user.__rowId || user._id || user.id} onClick={() => handleSelectUser(user)} className={`cursor-pointer transition-colors ${selectedUser?.email === user.email ? 'bg-indigo-50/60' : 'hover:bg-gray-50'}`}>
                    <td className="p-4 font-medium text-gray-800">{user.userName || user.name || "Sin nombre"}</td>
                    <td className="p-4 text-gray-600">{user.companyName || "N/A"}</td>
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4 text-gray-600"><span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium border border-gray-200">{user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</span></td>
                    <td className="p-4 text-center">
                      {user.status === 'Active' || user.status === 'Activo' || user.isActive ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 inline-block" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 inline-block" />
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">No se encontraron usuarios registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 0 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <span className="text-sm text-gray-500">
                Mostrando <span className="font-medium">{(crud.currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-medium">{Math.min(crud.currentPage * itemsPerPage, safeUsers.length)}</span> de <span className="font-medium">{safeUsers.length}</span> usuarios
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => crud.setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={crud.currentPage <= 1}
                  className="p-1 rounded-md border border-gray-200 bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-gray-600 px-2 flex items-center gap-1">
                  Página 
                  <span className="px-2 font-bold">{crud.currentPage}</span>
                  de {totalPages}
                </span>
                <button 
                  onClick={() => crud.setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={crud.currentPage >= totalPages}
                  className="p-1 rounded-md border border-gray-200 bg-white text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

