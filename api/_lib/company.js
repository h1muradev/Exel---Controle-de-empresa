import { sql } from './db.js';

export async function nextCompanyCode() {
  const { rows } = await sql`
    SELECT codigo FROM companies ORDER BY codigo DESC LIMIT 1;
  `;
  const last = rows[0]?.codigo || 'EMP0000';
  const number = Number(last.replace(/\D/g, '')) + 1;
  return `EMP${String(number).padStart(4, '0')}`;
}

export function normalizeDigits(value) {
  return (value || '').replace(/\D/g, '');
}
