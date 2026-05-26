import React, { useState } from "react";
import { useNotification } from "@/presentacion/ganchos/useNotification";
import { useSession } from "@/presentacion/ganchos/useSession";
import { useCompanyFilter } from "@/presentacion/ganchos/useCompanyFilter";
import { CreditCard, Download, Loader2 } from "lucide-react";

/**
 * @filePurpose CardCodesPage.jsx
 * @description Vista personalizada para la generacion y exportacion en PDF de codigos de tarjeta.
 * Utiliza un endpoint especializado para la creacion transaccional y descarga directa del documento.
 */
export const CardCodesPage = () => {
  const { apiBase, token } = useSession();
  const { companies } = useCompanyFilter(); // Reutilizamos el hook para poblar las companias
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    companyId: "",
    unitPrice: "",
    format: "Lote",
    quantity: "",
    designId: "diseño_1",
    pdfFormat: "separate"
  });
  const [loading, setLoading] = useState(false);

  // Manejador de cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Logica transaccional de generacion y descarga
  const handleGeneratePdf = async (e) => {
    e.preventDefault();

    if (!formData.companyId || !formData.unitPrice || !formData.quantity) {
      alert("Por favor, completa todos los campos requeridos antes de generar las tarjetas.");
      return;
    }

    setLoading(true);
    try {
      const totalQuantity = formData.format === "Lote" ? Number(formData.quantity) * 100 : Number(formData.quantity);
      const endpoint = apiBase.includes('/api') ? `${apiBase}/admin/codes/pdf` : `${apiBase}/api/admin/codes/pdf`;

      // Funcion interna para realizar la descarga de un formato especifico
      const downloadPdf = async (format) => {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            pdfFormat: format,
            designId: formData.designId,
            companyId: formData.companyId,
            unitPrice: Number(formData.unitPrice),
            quantity: totalQuantity,
            purchaseType: true,
            frontendBaseUrl: import.meta.env.VITE_QR_BASE_URL || window.location.origin
          }),
        });

        if (!response.ok) throw new Error(`Error al generar el PDF (${format})`);

        const blob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
        const link = document.createElement("a");
        link.href = url;

        const designNames = {
          "diseño_1": "Clasico",
          "diseño_2": "Premium",
          "diseño_3": "Moderno"
        };
        const designName = designNames[formData.designId] || "Personalizado";
        const fileNameType = format === "fronts" ? "Frentes" : (format === "interleaved" ? "Intercalado" : "Traseras");
        
        link.setAttribute("download", `Tarjetas_${fileNameType}_${designName}_${Date.now()}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      };

      if (formData.pdfFormat === "separate") {
        // Primero descargamos las traseras (para que se creen en la BD)
        await downloadPdf("backs");
        // Luego descargamos los frentes
        await downloadPdf("fronts");
      } else {
        // Descargamos solo el intercalado
        await downloadPdf("interleaved");
      }

      showNotification("Proceso completado con exito.", "success");
      setFormData({ ...formData, companyId: "", unitPrice: "", quantity: "" });
    } catch (error) {
      console.error("Error en la descarga:", error);
      alert("Ocurrio un error al generar las tarjetas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans flex items-start justify-center pt-12">
      {/* Contenedor Principal */}
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100 w-full max-w-lg">

        {/* Encabezado */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full mb-4">
            <CreditCard className="w-10 h-10" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Tarjetas</h1>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Configura los parametros para generar y descargar nuevos folios.
          </p>
        </div>

        {/* Formulario Central */}
        <form onSubmit={handleGeneratePdf} className="space-y-6">

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Compania</label>
            <select name="companyId" value={formData.companyId} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-gray-700">
              <option value="">Selecciona una compania...</option>
              {(Array.isArray(companies) ? companies : []).map((company) => (
                <option key={company._id || company.id} value={company._id || company.id}>
                  {company.name || company.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Diseño de tarjeta</label>
            <select name="designId" value={formData.designId} onChange={handleChange} className="...">
              <option value="diseño_1">Diseño clasico (Crema)</option>
              <option value="diseño_2">Diseño premium (Negro)</option>
              <option value="diseño_3">Diseño Moderno (Ondas)</option>
            </select>
          </div>

          {formData.designId && (
            <div className="mt-4 p-2 border border-gray-100 rounded-2xl bg-gray-50">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Vista previa del diseño</p>
              <img
                src={`${apiBase.replace('/api',
                  '')}/images/${formData.designId}_preview.png`}
                alt="Preview"
                className="w-full h-auto rounded-xl shadow-sm"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Formato del PDF</label>
            <select name="pdfFormat" value={formData.pdfFormat} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-gray-700">
              <option value="separate">Frente y traseras por separado (2 archivos)</option>
              <option value="interleaved">Intercalado Frente y Traseras (1 archivo)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">$ Precio unitario (MXN) $</label>
            <input type="number" step="0.01" min="0" name="unitPrice" value={formData.unitPrice} onChange={handleChange} placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-gray-700" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Formato</label>
              <select name="format" value={formData.format} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-gray-700">
                <option value="Lote">Lotes</option>
                <option value="Unidad">Unidad</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Cantidad</label>
              <input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Ej. 10" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-gray-700" />
            </div>
          </div>

          {/* Boton de accion */}
          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-md shadow-indigo-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
              {loading ? "Generando..." : "Generar y descargar Pdf"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

