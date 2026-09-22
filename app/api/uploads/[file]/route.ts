// Serves files uploaded through the admin dashboard. See lib/admin/store.ts.

import { readFile } from "node:fs/promises";
import path from "node:path";

import { uploadsDir } from "@/lib/admin/store";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
};

export async function GET(_: Request, context: RouteContext<"/api/uploads/[file]">) {
  const { file } = await context.params;
  // Names are generated UUIDs; anything else, including a path, is refused.
  if (!/^[0-9a-f-]{36}\.[a-z0-9]+$/.test(file)) return new Response("Not found", { status: 404 });
  try {
    const body = await readFile(path.join(uploadsDir(), file));
    return new Response(body, {
      headers: {
        "content-type": TYPES[path.extname(file)] ?? "application/octet-stream",
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
