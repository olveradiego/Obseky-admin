/**
 * @filePurpose SessionContext.jsx
 * @description Proveedor de sesion/autenticacion. Gestiona login, perfil y metadata remota.
 */
import { buildMetaConfig } from "../../aplicacion/adaptadores/metaConfigAdapter";
import { useCallback, useEffect, useMemo, useState } from "react";
import { mapApiError } from "../../aplicacion/errores/mapApiError";
import { loginAndLoadProfile } from "../../aplicacion/casos-de-uso/loginAndLoadProfile";
import { API_BASE_URL } from "../../infraestructura/configuracion/env";
import { createAuthRepository } from "../../infraestructura/repositorios/authRepository";
import { createMetaRepository } from "../../infraestructura/repositorios/metaRepository";
import { clearSession, loadSession, saveSession } from "../../infraestructura/almacenamiento/sessionStorage";
import { SessionContext } from "./sessionContextValue";
export { SessionContext };

const EMPTY_LOGIN = { email: "", password: "" };

/**
 * @function SessionProvider
 * @description Ejecuta la logica asociada a 'session provider' y retorna su resultado.
 */
export const SessionProvider = ({ children }) => {
  const storedSession = loadSession();

  const [apiBase, setApiBase] = useState(storedSession?.apiBase || API_BASE_URL);
  const [token, setToken] = useState(storedSession?.token || "");
  const [profile, setProfile] = useState(null);
  const [metaConfig, setMetaConfig] = useState(null);
  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState("");

  /**
   * @function authRepository
   * @description Ejecuta la logica asociada a 'auth repository' y retorna su resultado.
   */
  const authRepository = useMemo(() => createAuthRepository(apiBase), [apiBase]);
  /**
   * @function metaRepository
   * @description Ejecuta la logica asociada a 'meta repository' y retorna su resultado.
   */
  const metaRepository = useMemo(() => createMetaRepository(apiBase), [apiBase]);

  /**
   * @function onChangeLogin
   * @description Ejecuta la logica asociada a 'on change login' y retorna su resultado.
   */
  const onChangeLogin = useCallback((field, value) => {
    setLoginForm((previous) => ({ ...previous, [field]: value }));
  }, []);

  /**
   * @function logout
   * @description Ejecuta la logica asociada a 'logout' y retorna su resultado.
   */
  const logout = useCallback(() => {
    setToken("");
    setProfile(null);
    setMetaConfig(null);
    setError("");
    clearSession();
  }, []);

  /**
   * @function login
   * @description Ejecuta la logica asociada a 'login' y retorna su resultado.
   */
  const login = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await loginAndLoadProfile({
        authRepository,
        credentials: loginForm,
      });

      if (!result.ok) {
        setError(result.error);
        return false;
      }

      setToken(result.token);
      setProfile(result.profile);
      const metaResult = await metaRepository.getMeta(result.token);
      if (!metaResult.ok) {
        setToken("");
        setProfile(null);
        setMetaConfig(null);
        setError(metaResult.error?.message || "No se pudo cargar metadata de configuracion.");
        return false;
      }
      setMetaConfig(buildMetaConfig(metaResult.data));
      saveSession({ apiBase, token: result.token });
      return true;
    } finally {
      setLoading(false);
    }
  }, [apiBase, authRepository, loginForm, metaRepository]);

  /**
   * @function refreshProfile
   * @description Ejecuta la logica asociada a 'refresh profile' y retorna su resultado.
   */
  const refreshProfile = useCallback(async () => {
    if (!token) {
      setBootstrapping(false);
      return;
    }

    setBootstrapping(true);
    setError("");
    try {
      const result = await authRepository.getProfile(token);
      if (!result.ok) {
        const apiError = result.error || mapApiError({ fallbackMessage: "No se pudo restaurar la sesion." });
        setError(apiError.message);
        logout();
        setBootstrapping(false);
        return;
      }

      setProfile(result.data);
      const metaResult = await metaRepository.getMeta(token);
      if (!metaResult.ok) {
        const apiError = metaResult.error || mapApiError({ fallbackMessage: "No se pudo cargar metadata de configuracion." });
        setError(apiError.message);
        logout();
        setBootstrapping(false);
        return;
      }
      setMetaConfig(buildMetaConfig(metaResult.data));
      saveSession({ apiBase, token });
      setBootstrapping(false);
    } catch (error) {
      const apiError = mapApiError({
        error,
        fallbackMessage: "Error de red o backend no disponible.",
      });
      setError(apiError.message);
      logout();
      setBootstrapping(false);
    }
  }, [apiBase, authRepository, logout, metaRepository, token]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (!token) return;
    saveSession({ apiBase, token });
  }, [apiBase, token]);

  const contextValue = useMemo(
    () => ({
      apiBase,
      setApiBase,
      token,
      profile,
      metaConfig,
      loginForm,
      onChangeLogin,
      loading,
      bootstrapping,
      error,
      login,
      refreshProfile,
      logout,
    }),
    [
      apiBase,
      token,
      profile,
      metaConfig,
      loginForm,
      onChangeLogin,
      loading,
      bootstrapping,
      error,
      login,
      refreshProfile,
      logout,
    ]
  );

 return (
  <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>
 );
};

