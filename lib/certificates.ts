export function calculateCertificateStatus(validade: Date, alertaDias: number) {
  const hoje = new Date();
  const alerta = new Date();
  alerta.setDate(hoje.getDate() + alertaDias);

  if (validade < hoje) return "VENCIDO";
  if (validade <= alerta) return "PERTO_DE_VENCER";
  return "ATIVO";
}
