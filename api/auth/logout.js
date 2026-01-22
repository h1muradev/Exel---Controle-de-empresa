import { json } from '../_lib/http.js';
import { clearAuthCookie } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }
  clearAuthCookie(res);
  return json(res, 200, { ok: true });
}
