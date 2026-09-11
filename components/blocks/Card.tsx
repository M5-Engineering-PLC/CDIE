// Block. One card shape for programme cards, feature panels and topic cards.
// The action is the only link, so no link nests inside another link.

import { Button } from "@/components/primitives/Button";
import type { Card as CardRecord } from "@/content/types";

export function Card({ card, tone = "surface" }: { card: CardRecord; tone?: "surface" | "raise" }) {
  return (
    <article
      className={`flex h-full flex-col gap-4 border border-line p-6 ${
        tone === "raise" ? "bg-raise" : "bg-surface"
      }`}
    >
      {card.eyebrow ? <p className="kicker">{card.eyebrow}</p> : null}
      <h3 className="display text-sub leading-snug text-ink">{card.title}</h3>
      <p className="text-body leading-relaxed text-ink-2">{card.summary}</p>
      <div className="mt-auto pt-2">
        <Button href={card.action.href} tone="quiet">
          {card.action.label}
        </Button>
      </div>
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
