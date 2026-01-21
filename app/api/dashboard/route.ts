import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/auth";
import { calculateCertificateStatus } from "../../../lib/certificates";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const companies = await prisma.company.findMany({
    include: { certificates: true }
  });

  const total = companies.length;
  const ativas = companies.filter((c) => c.status === "ATIVA").length;
  const inadimplentes = companies.filter((c) => c.status === "INADIMPLENTE").length;
  const emitemNfe = companies.filter((c) => c.emiteNfe).length;

  let certificadosAtivo = 0;
  let certificadosPerto = 0;
  let certificadosVencido = 0;

  companies.forEach((company) => {
    company.certificates.forEach((cert) => {
      const status = calculateCertificateStatus(cert.validade, cert.alertaDias ?? 30);
      if (status === "ATIVO") certificadosAtivo += 1;
      if (status === "PERTO_DE_VENCER") certificadosPerto += 1;
      if (status === "VENCIDO") certificadosVencido += 1;
    });
  });

  return NextResponse.json({
    kpis: {
      total,
      ativas,
      inadimplentes,
      emitemNfe,
      certificadosAtivo,
      certificadosPerto,
      certificadosVencido
    }
  });
}
