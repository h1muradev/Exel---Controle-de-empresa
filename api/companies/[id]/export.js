import { json } from '../../_lib/http.js';
import { sql } from '../../_lib/db.js';
import { getSessionUser } from '../../_lib/session.js';
import { requireRole } from '../../_lib/rbac.js';

export default async function handler(req, res) {
  const user = await getSessionUser(req);
  if (!user) {
    return json(res, 401, { error: 'Não autenticado.' });
  }
  if (!requireRole(user, 'MANAGER')) {
    return json(res, 403, { error: 'Sem permissão.' });
  }

  const companyId = req.query.id;
  const { rows: companies } = await sql`SELECT * FROM companies WHERE id = ${companyId};`;
  if (!companies[0]) {
    return json(res, 404, { error: 'Empresa não encontrada.' });
  }

  const { rows: certificates } = await sql`SELECT * FROM certificates WHERE company_id = ${companyId};`;
  const { rows: notes } = await sql`SELECT * FROM notes WHERE company_id = ${companyId};`;

  return json(res, 200, {
    company: companies[0],
    certificates,
    notes
  });
}
