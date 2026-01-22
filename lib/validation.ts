import { z } from "zod";

export const companySchema = z.object({
  apelido: z.string().min(2),
  cnpj: z.string().min(14),
  responsavel: z.string().optional(),
  cpf: z.string().optional(),
  tipoUnidade: z.enum(["MATRIZ", "FILIAL"]),
  matrizId: z.string().uuid().nullable().optional(),
  status: z.enum(["ATIVA", "INATIVA", "INADIMPLENTE"]),
  emiteNfe: z.boolean(),
  emiteNfce: z.boolean(),
  emiteIss: z.boolean()
});

export const certificateSchema = z.object({
  validade: z.string().min(10),
  alertaDias: z.number().int().positive().optional()
});

export const noteSchema = z.object({
  texto: z.string().min(3)
});

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}
