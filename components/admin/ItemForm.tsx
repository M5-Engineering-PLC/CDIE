"use client";

// The add form for one dashboard collection, built from its field list. Internal tooling.

import { useActionState, useRef } from "react";

import { createItem } from "@/app/admin/actions";
import type { Collection, Field } from "@/lib/admin/collections";

const input = "border border-line bg-surface px-3 py-2 text-body text-ink";

function Control({ field }: { field: Field }) {
  const common = { name: field.name, required: field.required, className: input };
  if (field.type === "textarea") return <textarea {...common} rows={4} />;
  if (field.type === "image") return <input {...common} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" />;
  if (field.type === "pdf") return <input {...common} type="file" accept="application/pdf" />;
  return <input {...common} type={field.type} />;
}

export function ItemForm({ collection }: { collection: Collection }) {
  const form = useRef<HTMLFormElement>(null);
  const [error, action, pending] = useActionState(async (previous: string | null, data: FormData) => {
    const result = await createItem(previous, data);
    if (!result) form.current?.reset();
    return result;
  }, null);

  return (
    <form ref={form} action={action} className="flex flex-col gap-3">
      <input type="hidden" name="collection" value={collection.id} />
      {collection.fields.map((field) => (
        <label key={field.name} className="flex flex-col gap-1 text-fine text-ink-2">
          <span>
            {field.label}
            {field.required ? " *" : ""}
          </span>
          <Control field={field} />
          {field.hint ? <span className="text-ink-3">{field.hint}</span> : null}
        </label>
      ))}
      {error ? <p role="alert" className="text-fine text-brand">{error}</p> : null}
      <button type="submit" disabled={pending} className="bg-brand px-4 py-2 text-body font-semibold text-surface transition hover:bg-brand-live disabled:opacity-50">
        {pending ? "Saving…" : `Add ${collection.singular}`}
      </button>
    </form>
  );
}
