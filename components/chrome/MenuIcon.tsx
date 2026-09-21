// Change request 2026-09-21, section 2: "change menu to hamburger and close to x".
// One icon, two states. The bars rotate into the cross rather than being
// swapped for a different glyph, so the control never blinks mid-tap.

export function MenuIcon({ open }: { open: boolean }) {
  const bar =
    "absolute left-0 h-0.5 w-full origin-center bg-current transition-all duration-300 ease-out";

  return (
    <span aria-hidden="true" className="relative block h-3.5 w-5">
      <span className={`${bar} ${open ? "top-1.5 rotate-45" : "top-0"}`} />
      <span className={`${bar} top-1.5 ${open ? "opacity-0" : "opacity-100"}`} />
      <span className={`${bar} ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
    </span>
  );
}
