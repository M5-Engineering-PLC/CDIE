/* Fix plan 2026-10-11, D4: private audit rows in the sheet, with a local JSON fallback. */
import { AUTH_ENABLED, currentAdmin } from "./auth";
import { auditEntry, type AuditEntry, type AuditInput } from "./auditFields";
import { appendAudit, readAudit } from "./store";

export type { AuditEntry, AuditInput } from "./auditFields";
export const auditWho = async () => AUTH_ENABLED ? (await currentAdmin()) ?? "Unknown" : "Sign-in off";

/* A publication stages these rows alongside its content, so validation failures create no audit writes. */
export async function audit(input: AuditInput, batch?: AuditEntry[]): Promise<boolean> {
  const entry = auditEntry(input);
  if (batch) { batch.push(entry); return true; }
  try { await appendAudit(entry); return true; }
  catch { console.error("[admin] activity entry did not save"); return false; }
}

export async function latestActivity(who = "", collection = ""): Promise<AuditEntry[]> {
  return (await readAudit()).filter((entry) => (!who || entry.who === who) && (!collection || entry.collection === collection))
    .sort((a, b) => b.at.localeCompare(a.at)).slice(0, 200);
}
