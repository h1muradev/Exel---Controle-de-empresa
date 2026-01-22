import { json } from '../../_lib/http.js';
import { sql } from '../../_lib/db.js';
import { getSessionUser } from '../../_lib/session.js';
import { requireRole } from '../../_lib/rbac.js';
import { logAudit } from '../../_lib/audit.js';

export default async function handler(req, res) {
  const user = await getSessionUser(req);
  if (!user) {
    return json(res, 401, { error: 'Não autenticado.' });
  }
  if (!requireRole(user, 'ADMIN')) {
    return json(res, 403, { error: 'Sem permissão.' });
  }

  const companyId = req.query.id;
  const { rows: beforeRows } = await sql`SELECT * FROM companies WHERE id = ${companyId};`;
  if (!beforeRows[0]) {
    return json(res, 404, { error: 'Empresa não encontrada.' });
  }

  const { rows } = await sql`
    UPDATE companies
    SET responsavel = NULL,
        cpf_enc = NULL,
        cpf_last4 = NULL,
        updated_at = NOW()
    WHERE id = ${companyId}
    RETURNING *;
  `;

  await logAudit({
    actorId: user.id,
    entity: 'company',
    entityId: companyId,
    action: 'anonymize',
    beforeData: beforeRows[0],
    afterData: rows[0]
  });

  return json(res, 200, { ok: true });
}
