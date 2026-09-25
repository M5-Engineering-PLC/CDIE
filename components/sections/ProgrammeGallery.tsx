// Lucid: Programmes > Masterclasses and training (the call and photographs band).
// Copy comes in as props; this file holds none. 2026-09-25: built for the
// training call poster and workshop photographs the client shared by Drive.

import Image from "next/image";

import { Section } from "./Section";

type Photo = { src: string; alt: string; width: number; height: number };

export type ProgrammeGalleryProps = {
  eyebrow: string;
  title: string;
  intro: string;
  call?: Photo;
  callTitle?: string;
  photos: readonly Photo[];
  galleryTitle: string;
};

export function ProgrammeGallery({ eyebrow, title, intro, call, callTitle = "The call", photos, galleryTitle }: ProgrammeGalleryProps) {
  return (
    <Section eyebrow={eyebrow} title={title} standfirst={intro}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {call ? (
          <div className="flex min-w-0 flex-col gap-6">
            <h3 className="kicker">{callTitle}</h3>
            <div className="overflow-hidden border border-line bg-raise">
              <Image src={call.src} alt={call.alt} width={call.width} height={call.height} sizes="(max-width: 1024px) 100vw, 40vw" className="h-auto w-full" />
            </div>
          </div>
        ) : null}
        <div className="flex min-w-0 flex-col gap-6">
          <h3 className="kicker">{galleryTitle}</h3>
          <ul className={`grid gap-4 ${photos.length > 2 ? "sm:grid-cols-2" : ""}`}>
            {photos.map((photo) => (
              <li key={photo.src} className="overflow-hidden border border-line bg-raise">
                <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 1024px) 100vw, 55vw" className="h-auto w-full" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
