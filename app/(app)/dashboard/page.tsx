import { KpiCard } from "../../../components/kpi-card";

async function getDashboard() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/dashboard`, {
    cache: "no-store"
  });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export default async function DashboardPage() {
  const data = await getDashboard();
  const kpis = data?.kpis ?? {
    total: 0,
    ativas: 0,
    inadimplentes: 0,
    emitemNfe: 0,
    certificadosAtivo: 0,
    certificadosPerto: 0,
    certificadosVencido: 0
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total de Empresas" value={kpis.total} />
        <KpiCard label="Qtd Ativas" value={kpis.ativas} />
        <KpiCard label="Qtd Inadimplentes" value={kpis.inadimplentes} />
        <KpiCard label="Emitem NFe" value={kpis.emitemNfe} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <KpiCard label="Certificados Ativos" value={kpis.certificadosAtivo} />
        <KpiCard label="Certificados Perto" value={kpis.certificadosPerto} />
        <KpiCard label="Certificados Vencidos" value={kpis.certificadosVencido} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card p-6">
          <h3 className="text-sm text-muted mb-4">Distribuição por Status</h3>
          <div className="h-52 flex items-center justify-center text-muted">
            Gráfico Pizza (Recharts)
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-sm text-muted mb-4">Emissão Fiscal</h3>
          <div className="h-52 flex items-center justify-center text-muted">
            Gráfico Barras
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-sm text-muted mb-4">Certificados por Status</h3>
          <div className="h-52 flex items-center justify-center text-muted">
            Gráfico Barras
          </div>
        </div>
      </section>
    </div>
  );
}
