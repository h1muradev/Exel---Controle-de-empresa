# Intranet Empresas — Gestão Corporativa

Sistema web privado para gestão de cadastro de empresas, compliance fiscal e certificados, com foco em segurança (LGPD + OWASP) e UX moderna.

## Stack (escolha e justificativa)
- **Next.js (App Router) + TypeScript**: full-stack moderno com SSR/Server Components e APIs internas.
- **TailwindCSS + shadcn/ui (base)**: UI consistente e rápida para design enterprise dark.
- **Prisma + PostgreSQL**: modelagem segura, migrations versionadas e queries tipadas.
- **Auth JWT (cookies HttpOnly)**: sessão segura para intranet, com expiração controlada.
- **Zod + Argon2**: validação e hash seguro de senhas.

## Requisitos atendidos
- RBAC (ADMIN/MANAGER/VIEWER) + permissões adicionais (VIEW_SENSITIVE).
- CRUD Empresas, Certificados, Observações.
- Dashboard com KPIs e gráficos (estrutura pronta).
- Busca inteligente global.
- Auditoria para mudanças relevantes.
- LGPD: minimização, mascaramento, criptografia opcional, retenção configurável.

## Como rodar (local)

### 1) Pré-requisitos
- Node.js 20+
- Docker (para PostgreSQL)

### 2) Configurar variáveis
```bash
cp .env.example .env
```

Preencha `AUTH_SECRET` e `FIELD_ENCRYPTION_KEY` (base64, 32 bytes). Exemplo:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3) Subir banco
```bash
docker compose up -d
```

### 4) Instalar deps
```bash
npm install
```

### 5) Migrations + Seed
```bash
npm run prisma:generate
npm run migrate
npm run seed
```

### 6) Rodar
```bash
npm run dev
```
Acesse: `http://localhost:3000`

Login inicial:
- **email:** admin@empresa.local
- **senha:** Admin@123 (trocar no primeiro login)

## Deploy (servidor interno)
1. Build da aplicação:
```bash
npm run build
```
2. Execute em modo produção:
```bash
npm run start
```
3. Use proxy interno (Nginx) com TLS.

## Deploy na Vercel (intranet)
- **Node.js 20+** (definido em `package.json` > `engines`).
- O arquivo `vercel.json` força `npm install --include=dev` para garantir plugins de build (PostCSS/Tailwind).
- Configure as mesmas variáveis do `.env.example` no painel da Vercel.
- Use um PostgreSQL externo (Neon/Supabase/RDS); o `docker-compose.yml` é apenas para dev local.

## Segurança (LGPD + OWASP) — Implementado
- Hash de senha **Argon2**.
- Cookies **HttpOnly** e `SameSite=Lax`.
- Rate limit em login.
- Validação de payloads com **Zod**.
- Auditoria em `audit_logs`.
- Criptografia opcional de CPF (AES-GCM) com `FIELD_ENCRYPTION_KEY`.
- Permissão específica para dados sensíveis.

## Checklist final de segurança/LGPD
- [x] Minimização de dados pessoais.
- [x] Controle de acesso por nível.
- [x] Log de auditoria.
- [x] Política de retenção configurável.
- [x] Criptografia de CPF.
- [x] Senhas com hash forte.
- [x] Sem dados sensíveis em logs.

## Scripts
- `npm run dev` — desenvolvimento
- `npm run build` — build
- `npm run start` — produção
- `npm run migrate` — migrations
- `npm run seed` — seed inicial

## Observações
- A UI de gráficos e tabelas está pronta para receber dados reais no frontend.
- Em produção, configure CSP/Helmet no reverse proxy e segredos no Vault/CI.
