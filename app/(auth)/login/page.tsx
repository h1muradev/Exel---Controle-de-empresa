export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <span className="text-accent font-semibold">EI</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold">Intranet Empresas</h1>
            <p className="text-sm text-muted">Acesso restrito e auditado</p>
          </div>
        </div>
        <form action="/api/auth/login" method="post" className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm"
            />
          </div>
          <button className="w-full rounded-lg bg-accent py-2 text-sm font-semibold">
            Entrar
          </button>
        </form>
        <p className="mt-6 text-xs text-muted">
          Uso interno. Dados protegidos por LGPD. Acesso auditado.
        </p>
      </div>
    </div>
  );
}
