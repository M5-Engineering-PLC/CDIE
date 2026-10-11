"use server";

/* Fix plan 2026-10-11, D1, D3, D4 and D7: validate every draft against fresh rows, then publish once. */
import { revalidatePath, updateTag } from "next/cache";
import { audit, auditWho, type AuditEntry } from "@/lib/admin/audit";
import { requireAdmin } from "@/lib/admin/auth";
import { collectionRecords } from "@/lib/admin/builtins";
import { onDashboard } from "@/lib/admin/collections";
import { CollectionConflict, validateChanges, type CollectionChange, type ChangeError } from "@/lib/admin/collectionDraft";
import { notifyContentChanged } from "@/lib/admin/github";
import { CMS_TAG, saveCollectionChanges, saveUpload, serialisePublication } from "@/lib/admin/store";

export async function publishChanges(collectionId: string, form: FormData): Promise<ChangeError | null> {
  await requireAdmin();
  const collection = onDashboard(collectionId);
  if (!collection) return { error: "Unknown section." };
  let changes: CollectionChange[];
  try { changes = JSON.parse(String(form.get("changes") ?? "")); }
  catch { return { error: "The changes could not be read." }; }
  return serialisePublication(async () => {
    let records: Awaited<ReturnType<typeof collectionRecords>>;
    try { records = await collectionRecords(collection.id, true); }
    catch { return { error: "The Google Sheet did not answer. Your draft is still here. Try again in a moment." }; }
    const files: Record<string, File> = {};
    for (const [name, value] of form.entries()) if (name.startsWith("new:") && value instanceof File && value.size > 0) files[name] = value;
    const result = validateChanges(collection, changes, records, files);
    if ("error" in result) return result;
    const who = await auditWho();
    const entries: AuditEntry[] = [];
    try {
      const uploaded = new Map<string, string>();
      for (const plan of result.plans) {
        for (const [name, value] of Object.entries(plan.fields)) {
          if (!collection.fields.some((field) => field.name === name && (field.type === "image" || field.type === "pdf")) || !value.startsWith("new:")) continue;
          if (!uploaded.has(value)) uploaded.set(value, await saveUpload(files[value]));
          plan.fields[name] = uploaded.get(value)!;
        }
        await audit({ who, action: plan.action, collection: collection.id, recordId: plan.recordId, recordTitle: plan.fields[collection.titleField] ?? plan.before?.fields[collection.titleField], summary: plan.summary }, entries);
      }
      await saveCollectionChanges(collection.id, result.plans, entries);
    } catch (error) {
      if (error instanceof CollectionConflict) return { error: error.message, changeId: error.changeId };
      // A transport failure can arrive after Google accepted a write. Never invite a blind retry.
      return { error: "Save did not finish. Your draft is still here. Reload the page to see what saved before trying again." };
    }
    updateTag(CMS_TAG);
    revalidatePath("/", "layout");
    await notifyContentChanged(`saved ${collection.id}`);
    return null;
  });
}
