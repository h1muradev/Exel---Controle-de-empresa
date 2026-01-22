import { prisma } from "./prisma";

export async function logAudit({
  actorId,
  action,
  entity,
  entityId,
  before,
  after,
  ip
}: {
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      entity,
      entityId,
      before: before ? JSON.stringify(before) : null,
      after: after ? JSON.stringify(after) : null,
      ipAddress: ip ?? null
    }
  });
}
