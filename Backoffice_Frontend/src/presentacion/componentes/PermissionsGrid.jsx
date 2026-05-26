/**
 * @filePurpose PermissionsGrid.jsx
 * @description Archivo de la aplicacion. Contiene logica/configuracion necesaria para su funcionamiento.
 */
/**
 * @function PermissionsGrid
 * @description Ejecuta la logica asociada a 'permissions grid' y retorna su resultado.
 */
export const PermissionsGrid = ({ items }) => (
  <div className="surface-card page-enter rounded-2xl bg-white p-5 md:p-6">
    <p className="section-title">Autorizacion</p>
    <h3 className="headline mt-1 text-lg font-semibold">Permisos del Rol</h3>
    <p className="mt-1 text-sm text-[var(--ink-soft)]">Matriz efectiva de acciones por modulo.</p>

    {items.length === 0 ? (
      <div className="panel-frame mt-4 rounded-xl px-3 py-3 text-sm text-[var(--ink-soft)]">
        Este usuario no tiene permisos declarados.
      </div>
    ) : (
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((entry) => (
          <article key={entry.moduleKey} className="surface-card rounded-xl bg-[#fffaf2] p-3">
            <p className="font-semibold capitalize">{entry.moduleKey}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {entry.actions.map((action) => (
                <span key={`${entry.moduleKey}-${action}`} className="meta-chip mono text-[10px]">
                  {action}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    )}
  </div>
);
