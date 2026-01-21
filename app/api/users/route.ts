import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/auth";
import { hasRole } from "../../../lib/rbac";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasRole(session.role, ["ADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      mustResetPassword: true,
      createdAt: true
    }
  });

  return NextResponse.json({ data: users });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasRole(session.role, ["ADMIN"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const passwordHash = await argon2.hash(body.password);

  const created = await prisma.user.create({
    data: {
      email: body.email.toLowerCase(),
      name: body.name,
      passwordHash,
      role: body.role ?? "VIEWER",
      status: "ACTIVE",
      mustResetPassword: true
    }
  });

  return NextResponse.json({ data: created }, { status: 201 });
}
