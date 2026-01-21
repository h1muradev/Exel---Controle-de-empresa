import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.toLowerCase() ?? "";
  if (!q) return NextResponse.json({ data: [] });

  const results = await prisma.company.findMany({
    where: {
      OR: [
        { apelido: { contains: q, mode: "insensitive" } },
        { cnpj: { contains: q } },
        { responsavel: { contains: q, mode: "insensitive" } }
      ]
    },
    take: 10,
    select: { id: true, apelido: true, cnpj: true, status: true }
  });

  return NextResponse.json({ data: results });
}
