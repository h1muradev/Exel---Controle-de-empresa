import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getSession } from "../../../../../lib/auth";
import { hasRole } from "../../../../../lib/rbac";
import { logAudit } from "../../../../../lib/audit";

export async function POST(
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

  const updated = await prisma.company.update({
    where: { id: params.id },
    data: {
      responsavel: null,
      cpfEncrypted: null
    }
  });

  await logAudit({
    actorId: session.sub,
    action: "ANONYMIZE",
    entity: "Company",
    entityId: params.id,
    before,
    after: updated,
    ip: req.headers.get("x-forwarded-for") ?? undefined
  });

  return NextResponse.json({ data: updated });
}
