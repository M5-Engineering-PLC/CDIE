// Block. One card shape for programme cards, service cards and topic cards.
// Blueprint 11, decision of 2026-09-11: the whole card is the target. The
// anchor stretches over the surface, so there is still exactly one link and the
// visible label still says where it goes.

import type { Card as CardRecord } from "@/content/types";

export function Card({ card, tone = "surface" }: { card: CardRecord; tone?: "surface" | "raise" }) {
  return (
    <article
      className={`card-hit flex h-full flex-col gap-3 border border-line p-6 ${
        tone === "raise" ? "bg-raise" : "bg-surface"
      }`}
    >
      {card.eyebrow ? <p className="kicker">{card.eyebrow}</p> : null}
      <h3 className="display text-sub leading-snug text-ink">{card.title}</h3>
      <p className="text-body leading-relaxed text-ink-2">{card.summary}</p>
      <p className="mt-auto pt-3 text-body font-medium text-brand">
        <a href={card.action.href} className="stretch no-underline">
          {card.action.label}
        </a>
      </p>
    </article>
  );
}

export function CardGrid({
  cards,
  columns = 3,
  tone = "surface",
}: {
  cards: CardRecord[];
  columns?: 2 | 3;
  tone?: "surface" | "raise";
}) {
  if (cards.length === 0) return null;
  return (
    <div
      className={`grid gap-5 ${
        columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      {cards.map((card) => (
        <Card key={card.id} card={card} tone={tone} />
      ))}
    </div>
  );
}
