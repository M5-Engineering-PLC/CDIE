/* Fix plan 2026-10-11, D4: project only the permitted audit fields, never credentials or file bytes. */
export type AuditInput = { who: string; action: string; collection?: string; recordId?: string; recordTitle?: string; summary: string };
export type AuditEntry = { at: string; who: string; action: string; collection: string; recordId: string; recordTitle: string; summary: string };

export function auditEntry(input: AuditInput, at = new Date().toISOString()): AuditEntry {
  const text = (value: unknown, limit = 300) => typeof value === "string" ? value.slice(0, limit) : "";
  return {
    at, who: text(input.who), action: text(input.action), collection: text(input.collection),
    recordId: text(input.recordId), recordTitle: text(input.recordTitle), summary: text(input.summary, 1000),
  };
}
