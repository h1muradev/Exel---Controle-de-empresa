import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getSession } from "../../../../../lib/auth";
import { certificateSchema } from "../../../../../lib/validation";
import { logAudit } from "../../../../../lib/audit";
import { hasRole } from "../../../../../lib/rbac";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const certificates = await prisma.certificate.findMany({
    where: { companyId: params.id },
    orderBy: { validade: "asc" }
  });

  return NextResponse.json({ data: certificates });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasRole(session.role, ["ADMIN", "MANAGER"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = certificateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.certificate.create({
    data: {
      companyId: params.id,
      validade: new Date(parsed.data.validade),
      alertaDias: parsed.data.alertaDias
    }
  });

  await logAudit({
    actorId: session.sub,
    action: "CREATE",
    entity: "Certificate",
    entityId: created.id,
    after: created,
    ip: req.headers.get("x-forwarded-for") ?? undefined
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
