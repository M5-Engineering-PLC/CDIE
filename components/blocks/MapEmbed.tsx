// Block. An embedded OpenStreetMap with a link to the full map.
// Moved out of PageHero on 2026-09-24 so Contact can place it under the form.

export type MapEmbedProps = { src: string; title: string; href: string };

export function MapEmbed({ src, title, href }: MapEmbedProps) {
  return (
    <figure className="flex flex-col gap-2">
      <div className="relative aspect-[4/3] overflow-hidden border border-line md:aspect-[5/4]">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
      <figcaption>
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-fine font-medium text-brand hover:text-brand-live">
          Open the full map
        </a>
      </figcaption>
    </figure>
  );
}
