import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth";
import { companySchema, onlyDigits } from "../../../../lib/validation";
import { encryptSensitive } from "../../../../lib/crypto";
import { logAudit } from "../../../../lib/audit";
import { hasRole } from "../../../../lib/rbac";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: { certificates: true, notes: true }
  });

  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: company });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasRole(session.role, ["ADMIN", "MANAGER"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = companySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const before = await prisma.company.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = parsed.data;
  const updated = await prisma.company.update({
    where: { id: params.id },
    data: {
      apelido: data.apelido,
      cnpj: onlyDigits(data.cnpj),
      responsavel: data.responsavel ?? null,
      cpfEncrypted: data.cpf ? await encryptSensitive(onlyDigits(data.cpf)) : null,
      tipoUnidade: data.tipoUnidade,
      matrizId: data.matrizId ?? null,
      status: data.status,
      emiteNfe: data.emiteNfe,
      emiteNfce: data.emiteNfce,
      emiteIss: data.emiteIss
    }
  });

  await logAudit({
    actorId: session.sub,
    action: "UPDATE",
    entity: "Company",
    entityId: updated.id,
    before,
    after: updated,
    ip: req.headers.get("x-forwarded-for") ?? undefined
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasRole(session.role, ["ADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const before = await prisma.company.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.company.delete({ where: { id: params.id } });

  await logAudit({
    actorId: session.sub,
    action: "DELETE",
    entity: "Company",
    entityId: params.id,
    before,
    after: null,
    ip: req.headers.get("x-forwarded-for") ?? undefined
  });

  return NextResponse.json({ ok: true });
}
