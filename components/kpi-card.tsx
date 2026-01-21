export function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-6">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-3xl font-semibold mt-2">{value}</p>
    </div>
  );
}
