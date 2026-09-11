// Accessibility. The first tab stop on every page.

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded-edge focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-brand focus:px-4 focus:py-2 focus:text-surface"
    >
      Skip to content
    </a>
  );
}
