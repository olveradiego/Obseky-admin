import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "@/presentacion/ganchos/useSession";
import { dispatchModuleCrudUseCase } from "@/aplicacion/casos-de-uso/dispatchModuleCrudUseCase";
import { createModuleRepository } from "@/infraestructura/repositorios/moduleRepository";
import { buildEndpointCatalogFromMeta } from "@/aplicacion/adaptadores/metaConfigAdapter";
import { MODULE_KEYS } from "@/dominio/constantes/modules";

/**
 * @filePurpose useCompanyFilter.js
 * @description Hook personalizado para gestionar el filtro de compaÃ±Ã­a en AnalyticsPage.
 */
export const useCompanyFilter = () => {
  const { apiBase, token, logout, metaConfig } = useSession();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("global"); // 'global' or companyName

  const moduleRepository = useMemo(
    () => createModuleRepository(apiBase, buildEndpointCatalogFromMeta(metaConfig)),
    [apiBase, metaConfig]
  );

  useEffect(() => {
    const loadCompanies = async () => {
      // Guard clause: Do not fetch if token is not available
      if (!token) {
        setCompanies([]); // Ensure companies state is reset or empty
        return;
      }
      try {
        const result = await dispatchModuleCrudUseCase({
          moduleRepository,
          method: "GET",
          moduleName: MODULE_KEYS.COMPANIES,
          token,
        });
        if (result.ok) {
          setCompanies(result.data.items || []);
        } else {
          if (result.status === 401) {
            logout();
          } else {
            console.error("Error fetching companies:", result.error);
          }
        }
      } catch (_err) {
        console.error("Network error fetching companies:", _err);
      }
    };

    loadCompanies();
  }, [moduleRepository, token, logout]); // Dependencies for refetching companies

  const handleCompanyChange = useCallback((eventOrValue) => {
    const nextValue =
      typeof eventOrValue === "string"
        ? eventOrValue
        : eventOrValue?.target?.value;

    setSelectedCompany(nextValue || "global");
  }, []);

  const companyOptions = useMemo(
    () =>
      companies.map((company) => ({
        value: company.id || company._id || "",
        label: company.name || company.companyName || company.businessName || "Compania sin nombre",
        raw: company,
      })),
    [companies]
  );

  const findCompanyById = useCallback(
    (companyId) => {
      const normalizedId = String(companyId || "").trim();
      if (!normalizedId) return null;
      return (
        companies.find((company) => String(company.id || company._id || "").trim() === normalizedId) || null
      );
    },
    [companies]
  );

  const getCompanyNameById = useCallback(
    (companyId, fallback = "") => {
      const company = findCompanyById(companyId);
      if (!company) return fallback;
      return company.name || company.companyName || company.businessName || fallback;
    },
    [findCompanyById]
  );

  return {
    companies,
    companyOptions,
    selectedCompany,
    handleCompanyChange,
    resetCompanyFilter: () => setSelectedCompany("global"),
    findCompanyById,
    getCompanyNameById,
    moduleRepository, // moduleRepository is still needed by AnalyticsPage.jsx
  };
};

