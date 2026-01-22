import { json } from './_lib/http.js';
import { getSessionUser } from './_lib/session.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return json(res, 405, { error: 'Method not allowed' });
  }
  const user = await getSessionUser(req);
  if (!user) {
    return json(res, 401, { error: 'Não autenticado.' });
  }
  return json(res, 200, {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    canViewSensitive: user.can_view_sensitive,
    mustResetPassword: user.must_reset_password
  });
}
