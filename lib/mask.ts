export function maskCnpj(value: string) {
  if (value.length < 14) return value;
  return `${value.slice(0, 2)}.***.***/****-${value.slice(-2)}`;
}

export function maskCpf(value: string) {
  if (value.length < 11) return value;
  return `***.***.${value.slice(6, 9)}-${value.slice(-2)}`;
}
