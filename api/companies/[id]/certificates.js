import { json, parseBody } from '../../_lib/http.js';
import { sql } from '../../_lib/db.js';
import { getSessionUser } from '../../_lib/session.js';
import { requireRole } from '../../_lib/rbac.js';
import { logAudit } from '../../_lib/audit.js';
import { computeStatus } from '../../_lib/certificates.js';

export default async function handler(req, res) {
  const user = await getSessionUser(req);
  if (!user) {
    return json(res, 401, { error: 'Não autenticado.' });
  }

  const companyId = req.query.id;

  if (req.method === 'GET') {
    const { rows } = await sql`
      SELECT id, validade, alert_days, created_at, updated_at
      FROM certificates WHERE company_id = ${companyId}
      ORDER BY validade ASC;
    `;
    const data = rows.map((row) => ({
      id: row.id,
      validade: row.validade,
      alertDays: row.alert_days,
      status: computeStatus(row.validade, row.alert_days),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    return json(res, 200, data);
  }

  if (req.method === 'POST') {
    if (!requireRole(user, 'MANAGER')) {
      return json(res, 403, { error: 'Sem permissão.' });
    }
    const body = await parseBody(req);
    if (!body.validade) {
      return json(res, 400, { error: 'Validade é obrigatória.' });
    }

    const { rows } = await sql`
      INSERT INTO certificates (company_id, validade, alert_days)
      VALUES (${companyId}, ${body.validade}, ${body.alertDays || 30})
      RETURNING *;
    `;

    await logAudit({
      actorId: user.id,
      entity: 'certificate',
      entityId: rows[0].id,
      action: 'create',
      beforeData: null,
      afterData: rows[0]
    });

    return json(res, 201, { id: rows[0].id });
  }

  if (req.method === 'PUT') {
    if (!requireRole(user, 'MANAGER')) {
      return json(res, 403, { error: 'Sem permissão.' });
    }

    const body = await parseBody(req);
    const { rows: beforeRows } = await sql`SELECT * FROM certificates WHERE id = ${body.id};`;
    if (!beforeRows[0]) {
      return json(res, 404, { error: 'Certificado não encontrado.' });
    }

    const { rows } = await sql`
      UPDATE certificates
      SET validade = ${body.validade || beforeRows[0].validade},
          alert_days = ${body.alertDays || beforeRows[0].alert_days},
          updated_at = NOW()
      WHERE id = ${body.id}
      RETURNING *;
    `;

    await logAudit({
      actorId: user.id,
      entity: 'certificate',
      entityId: body.id,
      action: 'update',
      beforeData: beforeRows[0],
      afterData: rows[0]
    });

    return json(res, 200, { ok: true });
  }

  if (req.method === 'DELETE') {
    if (!requireRole(user, 'ADMIN')) {
      return json(res, 403, { error: 'Sem permissão.' });
    }

    const body = await parseBody(req);
    const { rows: beforeRows } = await sql`SELECT * FROM certificates WHERE id = ${body.id};`;
    await sql`DELETE FROM certificates WHERE id = ${body.id};`;

    await logAudit({
      actorId: user.id,
      entity: 'certificate',
      entityId: body.id,
      action: 'delete',
      beforeData: beforeRows[0] || null,
      afterData: null
    });

    return json(res, 200, { ok: true });
  }

  return json(res, 405, { error: 'Method not allowed' });
}
