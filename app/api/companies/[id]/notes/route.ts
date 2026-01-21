import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getSession } from "../../../../../lib/auth";
import { noteSchema } from "../../../../../lib/validation";
import { logAudit } from "../../../../../lib/audit";
import { hasRole } from "../../../../../lib/rbac";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notes = await prisma.note.findMany({
    where: { companyId: params.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data: notes });
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
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await prisma.note.create({
    data: {
      companyId: params.id,
      texto: parsed.data.texto,
      createdByUserId: session.sub
    }
  });

  await logAudit({
    actorId: session.sub,
    action: "CREATE",
    entity: "Note",
    entityId: created.id,
    after: created,
    ip: req.headers.get("x-forwarded-for") ?? undefined
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
