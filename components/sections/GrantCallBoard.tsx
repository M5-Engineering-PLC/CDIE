// Copy: PROGRAMMES > Catalyst grants, from the Catalyst Grant call for proposals poster.
/*
  Review 2026-10-19: "the image feels extremely out of place just being a
  square below". The call's details now take the poster's own layout: two
  photographs cut to overlapping circles on the left, the criteria and the
  grant terms on blue panels to the right, and the two ways in as white pills
  beneath them. It replaces GrantCallDetails and the one-photo gallery.
*/

import Link from "next/link";

import { CirclePhoto } from "@/components/blocks/CirclePhoto";

export type GrantCallBoardProps = {
  intro: string;
  criteria: string[];
  grant: { value: string; notes: string[] };
  rolling: string;
  photos: { src: string; alt: string }[];
  action: { label: string; href: string };
};

function PillIcon({ path }: { path: string }) {
  return (
    <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand text-surface md:h-12 md:w-12">
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
      </svg>
    </span>
  );
}

const CALENDAR = "M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM9 14l2 2 4-4";
const PIN = "M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z";

export function GrantCallBoard({ intro, criteria, grant, rolling, photos, action }: GrantCallBoardProps) {
  const [large, small] = photos;
  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <p className="max-w-[62ch] text-lead leading-relaxed text-ink-2">{intro}</p>

      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-12">
        {/* The poster's pair: the larger circle sits high, the smaller overlaps it low and left. */}
        <div className="relative mx-auto aspect-[10/11] w-full max-w-[26rem] lg:max-w-none">
          {large ? (
            <CirclePhoto src={large.src} alt={large.alt} sizes="(max-width: 1024px) 70vw, 30vw" className="absolute right-0 top-0 w-[74%]" />
          ) : null}
          {small ? (
            <CirclePhoto src={small.src} alt={small.alt} sizes="(max-width: 1024px) 50vw, 22vw" className="absolute bottom-0 left-0 w-[56%]" />
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[2rem] bg-brand p-6 text-surface md:p-9">
            <h3 className="display text-sub">Projects should demonstrate</h3>
            <ul className="mt-4 flex list-disc flex-col gap-2 pl-5 text-body leading-relaxed marker:text-brand-lift">
              {criteria.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] bg-brand-live p-6 text-surface md:p-9">
            <p className="kicker !text-surface/80">Grants</p>
            <p className="display mt-1 text-title">{grant.value}</p>
            {grant.notes.map((note) => (
              <p key={note} className="mt-2 text-body leading-relaxed">
                {note}
              </p>
            ))}
          </div>

          <div className="flex items-center gap-4 rounded-full border border-line bg-surface py-2 pl-2 pr-6 shadow-sm">
            <PillIcon path={CALENDAR} />
            <p className="display text-body md:text-lead">{rolling}</p>
          </div>

          <Link
            href={action.href}
            className="group flex items-center gap-4 rounded-full border border-line bg-surface py-2 pl-2 pr-6 text-ink no-underline shadow-sm transition hover:border-brand-lift"
          >
            <PillIcon path={PIN} />
            <span className="display text-body underline-offset-4 group-hover:underline md:text-lead">{action.label}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
