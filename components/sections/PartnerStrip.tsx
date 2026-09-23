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
      <div className="shell band-y">
        <p id="partners-title" className="kicker text-center">Partners</p>
        {/* changes-v2 item 6: one per row on a phone, two by two from sm and
            all four across from lg, so the row never breaks 1,1,2. */}
        <div className="mt-6 grid grid-cols-1 items-center justify-items-center gap-x-10 gap-y-8 sm:grid-cols-2 md:mt-9 md:gap-x-14 lg:grid-cols-4">
          {partners.map((partner) => (
            <div key={partner.src} className="grid h-14 w-full place-items-center md:h-20">
              <Image src={partner.src} alt={partner.alt} width={partner.width} height={partner.height} unoptimized className="max-h-11 w-auto max-w-40 object-contain md:max-h-16 md:max-w-52" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
