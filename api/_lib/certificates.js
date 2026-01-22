export function computeStatus(validade, alertDays) {
  if (!validade) return null;
  const today = new Date();
  const expiry = new Date(validade);
  const limit = new Date();
  limit.setDate(limit.getDate() + Number(alertDays || 30));
  if (expiry < today) return 'VENCIDO';
  if (expiry <= limit) return 'PERTO_DE_VENCER';
  return 'ATIVO';
}
