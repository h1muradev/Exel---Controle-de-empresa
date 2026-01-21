import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/auth";
import { companySchema, onlyDigits } from "../../../lib/validation";
import { encryptSensitive } from "../../../lib/crypto";
import { logAudit } from "../../../lib/audit";
import { hasRole } from "../../../lib/rbac";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { certificates: true }
  });

  return NextResponse.json({ data: companies });
}

export async function POST(req: NextRequest) {
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

  const data = parsed.data;
  const cnpj = onlyDigits(data.cnpj);
  const cpf = data.cpf ? await encryptSensitive(onlyDigits(data.cpf)) : null;

  const created = await prisma.company.create({
    data: {
      codigo: await nextCompanyCode(),
      apelido: data.apelido,
      cnpj,
      responsavel: data.responsavel ?? null,
      cpfEncrypted: cpf,
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
    action: "CREATE",
    entity: "Company",
    entityId: created.id,
    after: created,
    ip: req.headers.get("x-forwarded-for") ?? undefined
  });

  return NextResponse.json({ data: created }, { status: 201 });
}

async function nextCompanyCode() {
  const last = await prisma.company.findFirst({
    orderBy: { createdAt: "desc" }
  });

  if (!last?.codigo) return "EMP0001";
  const numeric = Number(last.codigo.replace(/\D/g, "")) + 1;
  return `EMP${numeric.toString().padStart(4, "0")}`;
}
