import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const encoder = new TextEncoder();

export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not set');
  }
  return encoder.encode(secret);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload) {
  const secret = getAuthSecret();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${process.env.TOKEN_TTL_MIN || 60}m`)
    .sign(secret);
}

export async function verifyToken(token) {
  const secret = getAuthSecret();
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export function getCookie(req, name) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setAuthCookie(res, token) {
  const cookie = [
    `auth_token=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Path=/',
    'SameSite=Lax'
  ];
  res.setHeader('Set-Cookie', cookie.join('; '));
}

export function clearAuthCookie(res) {
  const cookie = [
    'auth_token=',
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    'Max-Age=0'
  ];
  res.setHeader('Set-Cookie', cookie.join('; '));
}
