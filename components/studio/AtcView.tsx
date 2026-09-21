"use client";

/*
  Change request 2026-09-21, section 4: "where relevant, the service may be
  offered in ATC so switch to that view".

  Metalworking and woodworking are not in the room model, and they are not
  missing from it by oversight: content/studio.ts records that the ATC's layout
  is not documented, so there are no coordinates to place them at. Lighting a
  bench in the Graduate School room for a service held in another building
  would be the invention AGENTS.md forbids.

  So selecting one switches the stage rather than the highlight. The room gives
  way to the ATC view: the photograph for that capability, and a plain sentence
  saying which side of the centre the reader has moved to. The tour keeps
  running underneath, so leaving this capability returns to the turning room.
*/

import Image from "next/image";

export type AtcViewProps = {
  name: string;
  spaceName: string;
  image: string;
  imageAlt: string;
};

export function AtcView({ name, spaceName, image, imageAlt }: AtcViewProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="relative aspect-video overflow-hidden border border-line bg-ink">
        <Image src={image} alt={imageAlt} fill sizes="(max-width: 1280px) 100vw, 70vw" className="object-cover" />
        <p className="absolute left-0 top-0 bg-brand px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-widest text-surface">
          {spaceName} view
        </p>
      </div>
      <p className="max-w-[60ch] text-fine text-ink-3">
        {`${name} is held at the ${spaceName}, beyond the room in the model. Its layout is not
          documented, so the view is photographic rather than a plan.`}
      </p>
    </div>
  );
}
