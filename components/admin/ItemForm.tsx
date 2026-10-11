"use client";

// Source: Fix plan 2026-10-11, D3 and D7. One local form adds or edits a draft, with a live preview.
import { useEffect, useRef, useState } from "react";
import type { Collection, Field } from "@/lib/admin/collections";
import type { Fields } from "@/lib/admin/collectionDraft";
import { ItemPreview } from "./ItemPreview";

const input = "border border-line bg-surface px-3 py-2 text-body text-ink";
function Control({ field, value }: { field: Field; value?: string }) {
  const common = { name: field.name, required: field.required, className: input };
  if (field.type === "textarea") return <textarea {...common} defaultValue={value} rows={4} />;
  if (field.type === "image" || field.type === "pdf") return <input {...common} required={field.required && !value} type="file" accept={field.type === "pdf" ? "application/pdf" : "image/jpeg,image/png,image/webp,image/gif,image/avif"} />;
  return <input {...common} type={field.type} defaultValue={value} />;
}

export function ItemForm({ collection, initial = {}, preview = initial, editing = false, disabled, onDraft, onCancel }: {
  collection: Collection; initial?: Fields; preview?: Fields; editing?: boolean; disabled: boolean;
  onDraft: (fields: Fields, files: Record<string, File>) => string | null;
  onCancel: () => void;
}) {
  const form = useRef<HTMLFormElement>(null);
  const urls = useRef<Record<string, { file: File; url: string }>>({});
  const [values, setValues] = useState(preview);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const current = urls.current;
    return () => Object.values(current).forEach((entry) => URL.revokeObjectURL(entry.url));
  }, []);
  const read = () => {
    if (!form.current) return;
    const data = new FormData(form.current);
    const next: Fields = {};
    for (const field of collection.fields) {
      const value = data.get(field.name);
      if (value instanceof File && value.size) {
        if (urls.current[field.name]?.file !== value) {
          if (urls.current[field.name]) URL.revokeObjectURL(urls.current[field.name].url);
          urls.current[field.name] = { file: value, url: URL.createObjectURL(value) };
        }
        next[field.name] = field.type === "image" ? urls.current[field.name].url : value.name;
      } else next[field.name] = field.type === "image" || field.type === "pdf" ? preview[field.name] ?? "" : String(value ?? "");
    }
    setValues(next);
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fields: Fields = {};
    const files: Record<string, File> = {};
    for (const field of collection.fields) {
      const value = data.get(field.name);
      if (value instanceof File && value.size) {
        const key = `new:${crypto.randomUUID()}`;
        files[key] = value;
        fields[field.name] = key;
      } else fields[field.name] = field.type === "image" || field.type === "pdf" ? initial[field.name] ?? "" : String(value ?? "");
    }
    setError(onDraft(fields, files));
  };
  return (
    <div className="grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <form ref={form} onSubmit={submit} onInput={read} onChange={read} className="flex flex-col gap-3">
        <fieldset disabled={disabled} className="flex flex-col gap-3">
          {collection.fields.map((field) => (
            <label key={field.name} className="flex flex-col gap-1 text-fine text-ink-2">
              <span>{field.label}{field.required ? " *" : ""}</span>
              <Control field={field} value={initial[field.name]} />
              {field.hint ? <span className="text-ink-3">{field.hint}</span> : null}
              {(field.type === "image" || field.type === "pdf") && initial[field.name] ? <span className="text-ink-3">{initial[field.name].startsWith("new:") && !preview[field.name] ? "Choose the draft file again after a reload." : "Keep the current file unless you choose another."}</span> : null}
            </label>
          ))}
          {error ? <p role="alert" className="text-fine text-brand">{error}</p> : null}
          <button type="submit" className="bg-brand px-4 py-2 text-body font-semibold text-surface transition hover:bg-brand-live disabled:opacity-50">
            {editing ? "Edit" : `Add ${collection.singular}`}
          </button>
          {editing ? <button type="button" onClick={onCancel} className="text-fine text-brand">Cancel</button> : null}
        </fieldset>
      </form>
      <div className="lg:sticky lg:top-6 lg:self-start"><ItemPreview collection={collection.id} values={values} /></div>
    </div>
  );
}
