# Excel-VM Control (Intranet)

Sistema web privado para gestão de empresas, compliance fiscal e certificados, com UI moderna (dark), autenticação com RBAC e auditoria. Implementado **apenas com HTML/CSS/JavaScript + funções serverless** na Vercel.

## Stack
- **Frontend:** HTML + CSS + JavaScript (vanilla).
- **Backend:** Vercel Serverless Functions (`/api/*.js`).
- **Banco:** Vercel Postgres (via `@vercel/postgres`).
- **Auth:** JWT assinado (cookie HttpOnly).

## Requisitos atendidos
- Login e RBAC (ADMIN/MANAGER/VIEWER) com bloqueio por tentativas.
- CRUD de Empresas, Certificados e Observações.
- Dashboard com KPIs e gráficos (Chart.js via CDN).
- Busca inteligente global.
- Auditoria para mudanças relevantes.
- LGPD: mascaramento de CPF/CNPJ e criptografia AES-GCM para CPF.

## Como rodar na Vercel
1. **Crie um Postgres na Vercel** e conecte este repositório.
2. Configure as variáveis abaixo no painel da Vercel (copie do `.env.example`):
   - `DATABASE_URL`
   - `AUTH_SECRET` (base64 32 bytes)
   - `FIELD_ENCRYPTION_KEY` (base64 32 bytes)
3. Rode o SQL em `db/schema.sql` no Postgres da Vercel.
4. Rode o seed (local ou via Vercel CLI):
   ```bash
   npm run seed
   ```
5. Deploy na Vercel.

## Rodar local (opcional)
- Instale o `vercel` CLI e use `vercel dev`.
- Use um Postgres externo (Neon/Supabase) e configure o `DATABASE_URL`.

## Credenciais iniciais (seed)
- **email:** admin@empresa.local
- **senha:** Admin@123 (trocar no primeiro login)

## Segurança e LGPD (implementado)
- Hash de senha com **bcryptjs**.
- Cookies HttpOnly para sessão.
- Bloqueio após N tentativas (lockout).
- Audit logs para mudanças.
- CPF criptografado (AES-GCM) e mascaramento para visualização.

## Observações
- Este projeto é voltado para intranet. Ajuste CORS e headers se exposto externamente.
