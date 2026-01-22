import { json, parseBody } from '../_lib/http.js';
import { sql } from '../_lib/db.js';
import { signToken, setAuthCookie, verifyPassword } from '../_lib/auth.js';

const LOCKOUT_ATTEMPTS = Number(process.env.LOCKOUT_ATTEMPTS || 5);
const LOCKOUT_MINUTES = Number(process.env.LOCKOUT_MINUTES || 15);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const body = await parseBody(req);
  const email = (body.email || '').toLowerCase().trim();
  const password = body.password || '';

  if (!email || !password) {
    return json(res, 400, { error: 'Email e senha são obrigatórios.' });
  }

  const { rows: attemptRows } = await sql`
    SELECT id, attempts, locked_until FROM login_attempts WHERE email = ${email};
  `;

  const attempt = attemptRows[0];
  const now = new Date();

  if (attempt?.locked_until && new Date(attempt.locked_until) > now) {
    return json(res, 423, { error: 'Conta bloqueada. Tente mais tarde.' });
  }

  const { rows } = await sql`
    SELECT id, email, name, password_hash, role, can_view_sensitive, status, must_reset_password
    FROM users WHERE email = ${email};
  `;

  const user = rows[0];

  if (!user || user.status !== 'ACTIVE') {
    await registerFailure(email, attempt);
    return json(res, 401, { error: 'Credenciais inválidas.' });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    await registerFailure(email, attempt);
    return json(res, 401, { error: 'Credenciais inválidas.' });
  }

  await sql`
    INSERT INTO login_attempts (email, attempts, locked_until, updated_at)
    VALUES (${email}, 0, NULL, NOW())
    ON CONFLICT (email) DO UPDATE SET attempts = 0, locked_until = NULL, updated_at = NOW();
  `;

  const token = await signToken({ sub: user.id, role: user.role });
  setAuthCookie(res, token);

  return json(res, 200, {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    canViewSensitive: user.can_view_sensitive,
    mustResetPassword: user.must_reset_password
  });
}

async function registerFailure(email, attempt) {
  const nextAttempts = (attempt?.attempts || 0) + 1;
  const lock = nextAttempts >= LOCKOUT_ATTEMPTS
    ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
    : null;

  await sql`
    INSERT INTO login_attempts (email, attempts, locked_until, updated_at)
    VALUES (${email}, ${nextAttempts}, ${lock}, NOW())
    ON CONFLICT (email) DO UPDATE SET attempts = ${nextAttempts}, locked_until = ${lock}, updated_at = NOW();
  `;
}
