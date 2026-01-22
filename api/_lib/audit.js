import { sql } from './db.js';

export async function logAudit({ actorId, entity, entityId, action, beforeData, afterData }) {
  await sql`
    INSERT INTO audit_logs (actor_id, entity, entity_id, action, before_data, after_data)
    VALUES (${actorId}, ${entity}, ${entityId}, ${action}, ${beforeData}, ${afterData});
  `;
}
