import { json, parseBody, getQuery } from '../_lib/http.js';
import { sql } from '../_lib/db.js';
import { getSessionUser } from '../_lib/session.js';
import { requireRole, canViewSensitive } from '../_lib/rbac.js';
import { logAudit } from '../_lib/audit.js';
import { decryptField, encryptField } from '../_lib/crypto.js';
import { maskCnpj, maskCpf, last4 } from '../_lib/mask.js';
import { nextCompanyCode, normalizeDigits } from '../_lib/company.js';

export default async function handler(req, res) {
  const user = await getSessionUser(req);
  if (!user) {
    return json(res, 401, { error: 'Não autenticado.' });
  }

  if (req.method === 'GET') {
    const query = getQuery(req);
    const status = query.status || null;
    const tipoUnidade = query.tipoUnidade || null;
    const emiteNfe = query.emiteNfe || null;

    const { rows } = await sql`
      SELECT id, codigo, apelido, cnpj, responsavel, cpf_enc, cpf_last4, tipo_unidade, matriz_id,
             status, emite_nfe, emite_nfce, emite_iss, created_at, updated_at
      FROM companies
      WHERE (${status}::text IS NULL OR status = ${status})
        AND (${tipoUnidade}::text IS NULL OR tipo_unidade = ${tipoUnidade})
        AND (${emiteNfe}::text IS NULL OR emite_nfe = (${emiteNfe}::text = 'true'))
      ORDER BY created_at DESC;
    `;

    const allowSensitive = canViewSensitive(user);
    const result = rows.map((row) => ({
      id: row.id,
      codigo: row.codigo,
      apelido: row.apelido,
      cnpj: allowSensitive ? row.cnpj : maskCnpj(row.cnpj),
      responsavel: row.responsavel,
      cpf: allowSensitive ? decryptField(row.cpf_enc) : maskCpf(row.cpf_last4),
      tipoUnidade: row.tipo_unidade,
      matrizId: row.matriz_id,
      status: row.status,
      emiteNfe: row.emite_nfe,
      emiteNfce: row.emite_nfce,
      emiteIss: row.emite_iss,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return json(res, 200, result);
  }

  if (req.method === 'POST') {
    if (!requireRole(user, 'MANAGER')) {
      return json(res, 403, { error: 'Sem permissão.' });
    }

    const body = await parseBody(req);
    const apelido = (body.apelido || '').trim();
    const cnpj = normalizeDigits(body.cnpj);
    const cpf = normalizeDigits(body.cpf || '');

    if (!apelido || !cnpj) {
      return json(res, 400, { error: 'Apelido e CNPJ são obrigatórios.' });
    }

    if (body.tipoUnidade === 'FILIAL' && !body.matrizId) {
      return json(res, 400, { error: 'Matriz é obrigatória para filial.' });
    }

    const codigo = await nextCompanyCode();
    const cpfEnc = cpf ? encryptField(cpf) : null;
    const cpfLast4 = cpf ? last4(cpf) : null;

    const { rows } = await sql`
      INSERT INTO companies (
        codigo, apelido, cnpj, responsavel, cpf_enc, cpf_last4,
        tipo_unidade, matriz_id, status, emite_nfe, emite_nfce, emite_iss
      )
      VALUES (
        ${codigo}, ${apelido}, ${cnpj}, ${body.responsavel || null}, ${cpfEnc}, ${cpfLast4},
        ${body.tipoUnidade || 'MATRIZ'}, ${body.matrizId || null}, ${body.status || 'ATIVA'},
        ${Boolean(body.emiteNfe)}, ${Boolean(body.emiteNfce)}, ${Boolean(body.emiteIss)}
      )
      RETURNING *;
    `;

    await logAudit({
      actorId: user.id,
      entity: 'company',
      entityId: rows[0].id,
      action: 'create',
      beforeData: null,
      afterData: rows[0]
    });

    return json(res, 201, { id: rows[0].id, codigo: rows[0].codigo });
  }

  return json(res, 405, { error: 'Method not allowed' });
}
