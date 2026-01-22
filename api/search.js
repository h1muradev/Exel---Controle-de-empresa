import { json, getQuery } from './_lib/http.js';
import { sql } from './_lib/db.js';
import { getSessionUser } from './_lib/session.js';

export default async function handler(req, res) {
  const user = await getSessionUser(req);
  if (!user) {
    return json(res, 401, { error: 'Não autenticado.' });
  }

  const { q } = getQuery(req);
  if (!q) {
    return json(res, 200, []);
  }

  const term = `%${q}%`;
  const digits = q.replace(/\D/g, '');
  const digitsTerm = digits ? `%${digits}%` : term;

  const { rows } = await sql`
    SELECT id, codigo, apelido, cnpj, status
    FROM companies
    WHERE apelido ILIKE ${term}
       OR responsavel ILIKE ${term}
       OR cnpj ILIKE ${digitsTerm}
    ORDER BY apelido ASC
    LIMIT 20;
  `;

  return json(res, 200, rows);
}
