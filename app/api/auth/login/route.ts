import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { prisma } from "../../../../lib/prisma";
import { createSession } from "../../../../lib/auth";
import { rateLimit } from "../../../../lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const limiter = rateLimit(`login:${ip}`, 5, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429 }
    );
  }

  const form = await req.formData();
  const email = String(form.get("email") ?? "").toLowerCase();
  const password = String(form.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status !== "ACTIVE") {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const permissions = await prisma.userPermission.findMany({
    where: { userId: user.id }
  });

  await createSession({
    sub: user.id,
    role: user.role,
    permissions: permissions.map((p) => p.permission)
  });

  return NextResponse.redirect(new URL("/dashboard", req.url));
}
