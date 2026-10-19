// Lucid: Programmes > Catalyst grants. Copy: PROGRAMMES > Catalyst grants.
/*
  2026-09-24: the call-for-proposals poster is the hero; "What is settled"
  gives way to the details of the May 2025 call and the grant event, and the
  page ends on LinkedIn and contact. Every fact is from CDIE's own posts; see
  catalystCall in content/programmes.ts.

  Review 2026-10-19: the current poster replaces the May 2025 one, and the
  call's details take the poster's layout (GrantCallBoard).
*/

import type { Metadata } from "next";

import { Button } from "@/components/primitives/Button";
import { GrantCallBoard } from "@/components/sections/GrantCallBoard";
import { PageHero } from "@/components/sections/PageHero";
import { PhotoGallery } from "@/components/sections/PhotoGallery";
import { Section } from "@/components/sections/Section";
import { catalystCall, catalystFollow, catalystGallery, catalystGrants } from "@/content/programmes";
import { socialAccounts } from "@/content/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Catalyst grants",
  description: catalystGrants.standfirst,
  path: "/programmes/catalyst-grants",
  image: catalystCall.hero,
});

const crumbs = [
  { label: "Programmes", href: "/programmes" },
  { label: "Catalyst grants", href: "/programmes/catalyst-grants" },
];

export default function CatalystGrantsPage() {
  const linkedIn = socialAccounts.find((account) => account.id === "linkedin");

  return (
    <>
      <PageHero
        eyebrow="Funding"
        headline={catalystGrants.headline}
        standfirst={catalystGrants.standfirst}
        crumbs={crumbs}
        image={catalystCall.hero}
        poster
      >
        <Button href={catalystGrants.action.href}>{catalystGrants.action.label}</Button>
      </PageHero>

      <Section eyebrow={catalystCall.eyebrow} title={catalystCall.headline}>
        <GrantCallBoard
          intro={catalystCall.intro}
          criteria={[...catalystCall.criteria]}
          grant={{ value: catalystCall.grant.value, notes: [...catalystCall.grant.notes] }}
          rolling={catalystCall.rolling}
          photos={[...catalystCall.photos]}
          action={{ label: "Submit your project to the team", href: catalystGrants.action.href }}
        />
      </Section>

      <Section tone="surface" eyebrow={catalystGallery.eyebrow} title={catalystGallery.headline} standfirst={catalystGallery.body}>
        <PhotoGallery photos={[...catalystGallery.photos]} />
      </Section>

      <Section eyebrow={catalystFollow.eyebrow} title={catalystFollow.headline} standfirst={catalystFollow.body}>
        <div className="flex flex-wrap gap-3">
          {linkedIn?.href ? (
            <Button href={linkedIn.href} external>
              {catalystFollow.linkedIn}
            </Button>
          ) : null}
          <Button href={catalystGrants.action.href} tone="outline">
            {catalystFollow.contact}
          </Button>
        </div>
      </Section>
    </>
  );
}
