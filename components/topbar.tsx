export function Topbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Dashboard - Gestão de Empresas</h1>
          <p className="text-sm text-muted">Acesso interno com auditoria</p>
        </div>
        <div className="w-full max-w-md">
          <input
            placeholder="Buscar por apelido, CNPJ ou responsável"
            className="w-full rounded-xl bg-surface border border-border px-4 py-2 text-sm"
          />
        </div>
      </div>
    </header>
  );
}
