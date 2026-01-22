import { json, parseBody } from '../../_lib/http.js';
import { sql } from '../../_lib/db.js';
import { getSessionUser } from '../../_lib/session.js';
import { requireRole } from '../../_lib/rbac.js';
import { logAudit } from '../../_lib/audit.js';

export default async function handler(req, res) {
  const user = await getSessionUser(req);
  if (!user) {
    return json(res, 401, { error: 'Não autenticado.' });
  }

  const companyId = req.query.id;

  if (req.method === 'GET') {
    const { rows } = await sql`
      SELECT n.id, n.texto, n.created_at, n.updated_at, u.name as created_by
      FROM notes n
      JOIN users u ON u.id = n.created_by
      WHERE company_id = ${companyId}
      ORDER BY n.created_at DESC;
    `;
    return json(res, 200, rows);
  }

  if (req.method === 'POST') {
    if (!requireRole(user, 'MANAGER')) {
      return json(res, 403, { error: 'Sem permissão.' });
    }
    const body = await parseBody(req);
    if (!body.texto) {
      return json(res, 400, { error: 'Observação é obrigatória.' });
    }

    const { rows } = await sql`
      INSERT INTO notes (company_id, texto, created_by)
      VALUES (${companyId}, ${body.texto}, ${user.id})
      RETURNING *;
    `;

    await logAudit({
      actorId: user.id,
      entity: 'note',
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
    const { rows: beforeRows } = await sql`SELECT * FROM notes WHERE id = ${body.id};`;
    if (!beforeRows[0]) {
      return json(res, 404, { error: 'Observação não encontrada.' });
    }

    const { rows } = await sql`
      UPDATE notes
      SET texto = ${body.texto || beforeRows[0].texto}, updated_at = NOW()
      WHERE id = ${body.id}
      RETURNING *;
    `;

    await logAudit({
      actorId: user.id,
      entity: 'note',
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
    const { rows: beforeRows } = await sql`SELECT * FROM notes WHERE id = ${body.id};`;
    await sql`DELETE FROM notes WHERE id = ${body.id};`;

    await logAudit({
      actorId: user.id,
      entity: 'note',
      entityId: body.id,
      action: 'delete',
      beforeData: beforeRows[0] || null,
      afterData: null
    });

    return json(res, 200, { ok: true });
  }

  return json(res, 405, { error: 'Method not allowed' });
}
