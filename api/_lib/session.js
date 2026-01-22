import { getCookie, verifyToken } from './auth.js';
import { sql } from './db.js';

export async function getSessionUser(req) {
  const token = getCookie(req, 'auth_token');
  if (!token) return null;
  try {
    const payload = await verifyToken(token);
    const { rows } = await sql`
      SELECT id, email, name, role, can_view_sensitive, status, must_reset_password
      FROM users
      WHERE id = ${payload.sub};
    `;
    return rows[0] || null;
  } catch (error) {
    return null;
  }
}
