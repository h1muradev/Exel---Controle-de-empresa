import { json, parseBody } from '../_lib/http.js';
import { sql } from '../_lib/db.js';
import { getSessionUser } from '../_lib/session.js';
import { requireRole, canViewSensitive } from '../_lib/rbac.js';
import { logAudit } from '../_lib/audit.js';
import { encryptField, decryptField } from '../_lib/crypto.js';
import { maskCnpj, maskCpf, last4 } from '../_lib/mask.js';
import { normalizeDigits } from '../_lib/company.js';

export default async function handler(req, res) {
  const user = await getSessionUser(req);
  if (!user) {
    return json(res, 401, { error: 'Não autenticado.' });
  }

  const id = req.query.id;

  if (req.method === 'GET') {
    const { rows } = await sql`
      SELECT * FROM companies WHERE id = ${id};
    `;
    const company = rows[0];
    if (!company) {
      return json(res, 404, { error: 'Empresa não encontrada.' });
    }

    const allowSensitive = canViewSensitive(user);
    return json(res, 200, {
      id: company.id,
      codigo: company.codigo,
      apelido: company.apelido,
      cnpj: allowSensitive ? company.cnpj : maskCnpj(company.cnpj),
      responsavel: company.responsavel,
      cpf: allowSensitive ? decryptField(company.cpf_enc) : maskCpf(company.cpf_last4),
      tipoUnidade: company.tipo_unidade,
      matrizId: company.matriz_id,
      status: company.status,
      emiteNfe: company.emite_nfe,
      emiteNfce: company.emite_nfce,
      emiteIss: company.emite_iss,
      createdAt: company.created_at,
      updatedAt: company.updated_at
    });
  }

  if (req.method === 'PUT') {
    if (!requireRole(user, 'MANAGER')) {
      return json(res, 403, { error: 'Sem permissão.' });
    }

    const body = await parseBody(req);
    const { rows: beforeRows } = await sql`SELECT * FROM companies WHERE id = ${id};`;
    if (!beforeRows[0]) {
      return json(res, 404, { error: 'Empresa não encontrada.' });
    }

    if (body.tipoUnidade === 'FILIAL' && !body.matrizId) {
      return json(res, 400, { error: 'Matriz é obrigatória para filial.' });
    }

    const cpf = normalizeDigits(body.cpf || '');
    const cpfEnc = cpf ? encryptField(cpf) : beforeRows[0].cpf_enc;
    const cpfLast4 = cpf ? last4(cpf) : beforeRows[0].cpf_last4;

    const { rows } = await sql`
      UPDATE companies
      SET apelido = ${body.apelido || beforeRows[0].apelido},
          cnpj = ${normalizeDigits(body.cnpj || beforeRows[0].cnpj)},
          responsavel = ${body.responsavel || null},
          cpf_enc = ${cpfEnc},
          cpf_last4 = ${cpfLast4},
          tipo_unidade = ${body.tipoUnidade || beforeRows[0].tipo_unidade},
          matriz_id = ${body.matrizId || null},
          status = ${body.status || beforeRows[0].status},
          emite_nfe = ${body.emiteNfe ?? beforeRows[0].emite_nfe},
          emite_nfce = ${body.emiteNfce ?? beforeRows[0].emite_nfce},
          emite_iss = ${body.emiteIss ?? beforeRows[0].emite_iss},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *;
    `;

    await logAudit({
      actorId: user.id,
      entity: 'company',
      entityId: id,
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

    const { rows: beforeRows } = await sql`SELECT * FROM companies WHERE id = ${id};`;
    await sql`DELETE FROM companies WHERE id = ${id};`;

    await logAudit({
      actorId: user.id,
      entity: 'company',
      entityId: id,
      action: 'delete',
      beforeData: beforeRows[0] || null,
      afterData: null
    });

    return json(res, 200, { ok: true });
  }

  return json(res, 405, { error: 'Method not allowed' });
}
