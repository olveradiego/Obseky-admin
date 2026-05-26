/**
 * @filePurpose SessionSummary.jsx
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
/**
 * @function SessionSummary
 * @description Ejecuta la logica asociada a 'session summary' y retorna su resultado.
 */
export const SessionSummary = ({ admin, onLogout }) => (
  <div className="surface-card page-enter grid gap-4 rounded-2xl bg-[var(--bg-elevated)] p-5 md:grid-cols-[minmax(0,1fr)_auto]">
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-white text-sm font-bold">
          {String(admin?.name || "A").trim().charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="section-title">Sesion</p>
          <div className="mt-1 flex items-center gap-2">
            <h2 className="text-lg font-semibold">Sesion Activa</h2>
            <span className="status-chip status-chip-live">Live</span>
          </div>
        </div>
      </div>

      <div className="mt-3 grid gap-2">
        <div className="info-pair">
          <span className="info-key">Nombre</span>
          <span className="info-value">{admin?.name || "-"}</span>
        </div>
        <div className="info-pair">
          <span className="info-key">Rol</span>
          <span className="info-value">{admin?.role || "-"}</span>
        </div>
        <div className="info-pair">
          <span className="info-key">Email</span>
          <span className="info-value mono text-xs">{admin?.email || "-"}</span>
        </div>
        <div className="info-pair">
          <span className="info-key">Origen</span>
          <span className="info-value">{admin?.source || "-"}</span>
        </div>
      </div>
    </div>
    <div className="flex items-start justify-end">
      <button onClick={onLogout} className="btn-core btn-danger px-4 py-2 text-sm">
        Cerrar sesion
      </button>
    </div>
  </div>
);
