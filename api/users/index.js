import { json, parseBody } from '../_lib/http.js';
import { sql } from '../_lib/db.js';
import { getSessionUser } from '../_lib/session.js';
import { requireRole } from '../_lib/rbac.js';
import { hashPassword } from '../_lib/auth.js';
import { logAudit } from '../_lib/audit.js';

export default async function handler(req, res) {
  const user = await getSessionUser(req);
  if (!user) {
    return json(res, 401, { error: 'Não autenticado.' });
  }
  if (!requireRole(user, 'ADMIN')) {
    return json(res, 403, { error: 'Sem permissão.' });
  }

  if (req.method === 'GET') {
    const { rows } = await sql`
      SELECT id, email, name, role, can_view_sensitive, status, must_reset_password, created_at
      FROM users ORDER BY created_at DESC;
    `;
    return json(res, 200, rows);
  }

  if (req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.email || !body.password || !body.name) {
      return json(res, 400, { error: 'Campos obrigatórios faltando.' });
    }

    const hash = await hashPassword(body.password);

    const { rows } = await sql`
      INSERT INTO users (email, name, password_hash, role, can_view_sensitive, status, must_reset_password)
      VALUES (${body.email.toLowerCase()}, ${body.name}, ${hash}, ${body.role || 'VIEWER'}, ${Boolean(body.canViewSensitive)}, ${body.status || 'ACTIVE'}, true)
      RETURNING *;
    `;

    await logAudit({
      actorId: user.id,
      entity: 'user',
      entityId: rows[0].id,
      action: 'create',
      beforeData: null,
      afterData: rows[0]
    });

    return json(res, 201, { id: rows[0].id });
  }

  if (req.method === 'PUT') {
    const body = await parseBody(req);
    const { rows: beforeRows } = await sql`SELECT * FROM users WHERE id = ${body.id};`;
    if (!beforeRows[0]) {
      return json(res, 404, { error: 'Usuário não encontrado.' });
    }

    const { rows } = await sql`
      UPDATE users
      SET name = ${body.name || beforeRows[0].name},
          role = ${body.role || beforeRows[0].role},
          can_view_sensitive = ${body.canViewSensitive ?? beforeRows[0].can_view_sensitive},
          status = ${body.status || beforeRows[0].status},
          updated_at = NOW()
      WHERE id = ${body.id}
      RETURNING *;
    `;

    await logAudit({
      actorId: user.id,
      entity: 'user',
      entityId: body.id,
      action: 'update',
      beforeData: beforeRows[0],
      afterData: rows[0]
    });

    return json(res, 200, { ok: true });
  }

  return json(res, 405, { error: 'Method not allowed' });
}
