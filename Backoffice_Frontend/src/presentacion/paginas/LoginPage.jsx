import { Navigate } from "react-router-dom";
import { LoginForm } from "@/presentacion/componentes/LoginForm";
import { ScreenState } from "@/presentacion/componentes/ScreenState";
import { useSession } from "@/presentacion/ganchos/useSession";
import { AuthCard } from "@/presentacion/componentes/interfaz/AuthCard";
import { LoginShell } from "@/presentacion/componentes/interfaz/LoginShell";

export const LoginPage = () => {
  const { token, loginForm, onChangeLogin, login, loading, error, bootstrapping } = useSession();

  const onSubmit = async (event) => {
    event.preventDefault();
    await login();
  };

  if (bootstrapping) {
    return (
      <LoginShell>
        <AuthCard
          eyebrow="LoginAdmin Frontend"
          title="Restaurando sesion"
          description="Estamos validando la sesion almacenada antes de mostrar el panel administrativo."
        >
          <ScreenState loading loadingLabel="Restaurando sesion..." error={error} />
        </AuthCard>
      </LoginShell>
    );
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <LoginShell>
      <AuthCard
        eyebrow="LoginAdmin Frontend"
        title="Iniciar sesion"
        description="Acceso seguro al panel administrativo, modulos operativos y analiticas del sistema."
      >
        <LoginForm
          loginForm={loginForm}
          onChangeLogin={onChangeLogin}
          onSubmit={onSubmit}
          loading={loading}
          error={error}
        />
      </AuthCard>
    </LoginShell>
  );
};

