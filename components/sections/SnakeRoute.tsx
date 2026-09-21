// Section. Copy: PROGRAMMES > How learning works. Lucid: Programmes, the four stages.
/*
  Change request 2026-09-21, section 3: "do a snake route on how learning works".

  The four stages were a row of four equal boxes, which said nothing about the
  fact that they run in order. They are now stations on one continuous route:
  the line is unbroken from the first stage to the last, and the cards zig-zag
  above and below it so the eye is pulled along the line rather than reading
  four parallel columns.

  On a phone the same route turns on its side and runs down the left margin,
  which is the shape a reader already knows from a timeline, and it keeps the
  band short per section 1.

  The route is drawn from the stage list, so adding or removing a stage moves
  the line with it. The rows are fixed at the wide breakpoint on purpose: every
  column must put its junction at the same height or the line breaks.
*/

export type RouteStage = {
  id: string;
  title: string;
  body: string;
};

export function SnakeRoute({ stages }: { stages: readonly RouteStage[] }) {
  return (
    <ol className="flex flex-col lg:flex-row">
      {stages.map((stage, index) => {
        const first = index === 0;
        const last = index === stages.length - 1;
        const above = index % 2 === 1;

        return (
          <li
            key={stage.id}
            className="grid flex-1 grid-cols-[2.25rem_1fr] lg:grid-cols-1 lg:grid-rows-[11rem_3.5rem_11rem]"
          >
            <div className="flex w-9 flex-col items-center lg:w-full lg:flex-row lg:col-start-1 lg:row-start-2">
              <span
                className={`w-px flex-1 lg:h-px lg:w-auto ${first ? "bg-transparent" : "bg-line"}`}
              />
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brand bg-surface font-mono text-fine text-brand">
                {index + 1}
              </span>
              <span
                className={`w-px flex-1 lg:h-px lg:w-auto ${last ? "bg-transparent" : "bg-line"}`}
              />
            </div>

            <div
              className={`pb-7 pl-4 lg:col-start-1 lg:px-4 lg:pb-0 ${
                above ? "lg:row-start-1 lg:flex lg:items-end" : "lg:row-start-3 lg:pt-5"
              }`}
            >
              <div>
                <h3 className="display text-sub leading-snug">{stage.title}</h3>
                <p className="mt-2 max-w-[34ch] text-body leading-relaxed text-ink-2">
                  {stage.body}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
