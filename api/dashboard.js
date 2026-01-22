import { json } from './_lib/http.js';
import { sql } from './_lib/db.js';
import { getSessionUser } from './_lib/session.js';

export default async function handler(req, res) {
  const user = await getSessionUser(req);
  if (!user) {
    return json(res, 401, { error: 'Não autenticado.' });
  }

  const { rows: configRows } = await sql`SELECT alert_days FROM app_config LIMIT 1;`;
  const alertDays = configRows[0]?.alert_days || 30;

  const { rows: companyCounts } = await sql`
    SELECT
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE status = 'ATIVA')::int as ativas,
      COUNT(*) FILTER (WHERE status = 'INADIMPLENTE')::int as inadimplentes,
      COUNT(*) FILTER (WHERE emite_nfe = true)::int as emite_nfe
    FROM companies;
  `;

  const { rows: statusCounts } = await sql`
    SELECT status, COUNT(*)::int as total
    FROM companies
    GROUP BY status;
  `;

  const { rows: emiteCounts } = await sql`
    SELECT
      COUNT(*) FILTER (WHERE emite_nfe = true)::int as nfe,
      COUNT(*) FILTER (WHERE emite_nfce = true)::int as nfce,
      COUNT(*) FILTER (WHERE emite_iss = true)::int as iss
    FROM companies;
  `;

  const { rows: certCounts } = await sql`
    SELECT
      COUNT(*) FILTER (WHERE validade < CURRENT_DATE)::int as vencido,
      COUNT(*) FILTER (WHERE validade >= CURRENT_DATE AND validade <= CURRENT_DATE + (${alertDays} || ' days')::interval)::int as perto,
      COUNT(*) FILTER (WHERE validade > CURRENT_DATE + (${alertDays} || ' days')::interval)::int as ativo
    FROM certificates;
  `;

  const { rows: expiring } = await sql`
    SELECT c.apelido, c.codigo, cert.validade
    FROM certificates cert
    JOIN companies c ON c.id = cert.company_id
    WHERE cert.validade <= CURRENT_DATE + (${alertDays} || ' days')::interval
    ORDER BY cert.validade ASC
    LIMIT 10;
  `;

  return json(res, 200, {
    kpis: {
      total: companyCounts[0]?.total || 0,
      ativas: companyCounts[0]?.ativas || 0,
      inadimplentes: companyCounts[0]?.inadimplentes || 0,
      emiteNfe: companyCounts[0]?.emite_nfe || 0,
      certificados: {
        ativo: certCounts[0]?.ativo || 0,
        perto: certCounts[0]?.perto || 0,
        vencido: certCounts[0]?.vencido || 0
      }
    },
    charts: {
      status: statusCounts,
      emite: emiteCounts[0] || { nfe: 0, nfce: 0, iss: 0 },
      certificados: certCounts[0] || { ativo: 0, perto: 0, vencido: 0 }
    },
    expiring,
    alertDays
  });
}
