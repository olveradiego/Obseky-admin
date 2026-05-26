import { FormActions } from "@/presentacion/componentes/interfaz/FormActions";
import { FormField } from "@/presentacion/componentes/interfaz/FormField";
import { ErrorState } from "@/presentacion/componentes/interfaz/ErrorState";

export const LoginForm = ({ loginForm, onChangeLogin, onSubmit, loading, error }) => (
  <form onSubmit={onSubmit} className="grid gap-5" aria-busy={loading}>
    <FormField label="Email" htmlFor="login-email">
      <input
        id="login-email"
        className="app-input"
        type="email"
        value={loginForm.email}
        onChange={(e) => onChangeLogin("email", e.target.value)}
        placeholder="empresa@correo.com"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "login-error" : undefined}
        required
      />
    </FormField>

    <FormField label="Password" htmlFor="login-password">
      <input
        id="login-password"
        className="app-input"
        type="password"
        value={loginForm.password}
        onChange={(e) => onChangeLogin("password", e.target.value)}
        placeholder="Ingresa tu password"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "login-error" : undefined}
        required
      />
    </FormField>

    {error ? <ErrorState title="Acceso denegado" message={error} className="p-4" /> : null}

    <FormActions className="border-t-0 pt-0">
      <button type="submit" disabled={loading} className="app-button app-button-primary w-full px-4 py-3">
        {loading ? "Iniciando..." : "Entrar al panel"}
      </button>
    </FormActions>
  </form>
);

