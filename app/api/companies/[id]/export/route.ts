import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getSession } from "../../../../../lib/auth";
import { hasRole } from "../../../../../lib/rbac";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasRole(session.role, ["ADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: { certificates: true, notes: true }
  });

  if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ data: company });
}
