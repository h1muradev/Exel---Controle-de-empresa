export function maskCnpj(value) {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length < 14) return '***';
  return `${digits.slice(0, 2)}.***.***/****-${digits.slice(-2)}`;
}

export function maskCpf(value) {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length < 11) return '***';
  return `***.***.***-${digits.slice(-2)}`;
}

export function last4(value) {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  return digits.slice(-4);
}
