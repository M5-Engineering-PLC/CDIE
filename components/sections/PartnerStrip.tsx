// Supplied homepage assets: the four partner marks approved with this review.
/*
  Change request 2026-09-13, section 3.2: full colour, at rest, no hover state.
  These are institutional endorsements, not links, so a hover response would
  promise an interaction that does not exist.
*/

import Image from "next/image";

const partners = [
  { src: "/images/partners/rice360.png", alt: "Rice360 Institute for Global Health Technologies", width: 214, height: 54 },
  { src: "/images/partners/riceuniversity.png", alt: "Rice University", width: 227, height: 31 },
  { src: "/images/partners/ku.png", alt: "Kenyatta University", width: 185, height: 48 },
  { src: "/images/partners/lemelson.png", alt: "The Lemelson Foundation", width: 192, height: 106 },
];

export function PartnerStrip() {
  return (
    <section aria-labelledby="partners-title" className="border-y border-line-soft bg-surface">
      <div className="shell py-14">
        <p id="partners-title" className="kicker text-center">Partners</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-14 gap-y-9 md:justify-between">
          {partners.map((partner) => (
            <div key={partner.src} className="grid h-20 min-w-40 place-items-center">
              <Image src={partner.src} alt={partner.alt} width={partner.width} height={partner.height} unoptimized className="max-h-16 w-auto max-w-52 object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
