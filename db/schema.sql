CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_days INTEGER NOT NULL DEFAULT 30,
  retention_notes_days INTEGER NOT NULL DEFAULT 730,
  retention_audit_days INTEGER NOT NULL DEFAULT 180,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_config (alert_days, retention_notes_days, retention_audit_days)
SELECT 30, 730, 180
WHERE NOT EXISTS (SELECT 1 FROM app_config);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'VIEWER')),
  can_view_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')),
  must_reset_password BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  apelido TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  responsavel TEXT,
  cpf_enc TEXT,
  cpf_last4 TEXT,
  tipo_unidade TEXT NOT NULL CHECK (tipo_unidade IN ('MATRIZ', 'FILIAL')),
  matriz_id UUID REFERENCES companies(id),
  status TEXT NOT NULL CHECK (status IN ('ATIVA', 'INATIVA', 'INADIMPLENTE')),
  emite_nfe BOOLEAN NOT NULL DEFAULT FALSE,
  emite_nfce BOOLEAN NOT NULL DEFAULT FALSE,
  emite_iss BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  validade DATE NOT NULL,
  alert_days INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  entity TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
