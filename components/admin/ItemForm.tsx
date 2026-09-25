"use client";

// The add form for one dashboard collection, built from its field list. Internal tooling.
// Beside it, the record as the public page will draw it, updated as the editor types.

import { useActionState, useEffect, useRef, useState } from "react";

import { createItem } from "@/app/admin/actions";
import type { Collection, Field } from "@/lib/admin/collections";

import { ItemPreview, type PreviewValues } from "./ItemPreview";

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
  const [values, setValues] = useState<PreviewValues>({});
  const [error, action, pending] = useActionState(async (previous: string | null, data: FormData) => {
    const result = await createItem(previous, data);
    if (!result) {
      form.current?.reset();
      setValues({});
    }
    return result;
  }, null);

  // Local files preview through object URLs; release each one when it is replaced.
  useEffect(() => () => Object.values(values).forEach((value) => value?.startsWith("blob:") && URL.revokeObjectURL(value)), [values]);

  const read = () => {
    const node = form.current;
    if (!node) return;
    const next: PreviewValues = {};
    for (const field of collection.fields) {
      const control = node.elements.namedItem(field.name) as HTMLInputElement | HTMLTextAreaElement | null;
      if (!control) continue;
      const file = control instanceof HTMLInputElement && control.type === "file" ? control.files?.[0] : undefined;
      next[field.name] = file ? (field.type === "image" ? URL.createObjectURL(file) : file.name) : control.value;
    }
    setValues(next);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
    <form ref={form} action={action} onInput={read} onChange={read} className="flex flex-col gap-3">
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
    <div className="lg:sticky lg:top-6 lg:self-start">
      <ItemPreview collection={collection.id} values={values} />
    </div>
    </div>
  );
}
