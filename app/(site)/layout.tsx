// The viewer site's chrome. Admin pages sit outside this group and carry their own bar.

import { ViewTransition } from "react";

import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteNav } from "@/components/chrome/SiteNav";
import { SkipLink } from "@/components/chrome/SkipLink";
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
      <ViewTransition default="page"><main id="main">{children}</main></ViewTransition>
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
    </>
  );
}
