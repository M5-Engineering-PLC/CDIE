// The viewer site's chrome. Admin pages sit outside this group and carry their own bar.

import { SiteAnalytics } from "@/components/chrome/SiteAnalytics";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteNav } from "@/components/chrome/SiteNav";
import { SkipLink } from "@/components/chrome/SkipLink";
import { Studio3DWarmup } from "@/components/studio/Studio3DWarmup";
import { contact, nav, site, socialAccounts, utilityLinks } from "@/content/site";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <SiteNav
        items={[...nav]}
        utility={[...utilityLinks]}
        name={site.name}
        longName={site.longName}
        institution={site.institution}
        logo={site.logo}
      />
      {/*
        Review 2026-10-19: the page-wide ViewTransition held every route change
        back behind a 170 ms fade-out, a 120 ms gap and a 300 ms fade-in, and
        waited on the new page's images. Measured: 300 to 520 ms before a click
        showed anything, against 23 to 116 ms without it. The page now swaps
        straight away.
      */}
      <main id="main">{children}</main>
      {/*
        Change request 2026-09-21: Contact leaves the top bar but not the
        site. The footer keeps it, so the route every enquiry resolves to is
        still one click from any page.
      */}
      <SiteFooter
        items={[...nav]}
        utility={[...utilityLinks]}
        contact={contact}
        name={site.name}
        longName={site.longName}
        institution={site.institution}
        socialAccounts={[...socialAccounts]}
      />
      <SiteAnalytics />
      {/*
        Review 2026-10-19: once a page is idle, fetch the Design Studio tour's
        code and prepare its rooms in small slices, so opening the tour later
        does not freeze the page. Skipped on data saver, slow links and low
        memory.
      */}
      <Studio3DWarmup />
    </>
  );
}
