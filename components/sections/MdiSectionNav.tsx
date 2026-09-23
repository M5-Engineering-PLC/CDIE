"use client";

// Lucid: MDI programme sections. The section names follow the page's Actual Copy headings.
import { useEffect, useState } from "react";

const sections = [
  { id: "structure", label: "Programme" },
  { id: "learning", label: "What you learn" },
  { id: "curriculum", label: "Curriculum & timeline" },
  { id: "applying", label: "Applying" },
  { id: "cohorts", label: "Success stories" },
];

export function MdiSectionNav() {
  const [active, setActive] = useState(sections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: "-20% 0px -65% 0px" });
    sections.forEach(({ id }) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="mdi-index" aria-label="Medical Device Innovation sections">
      <p className="kicker">On this page</p>
      <ol>
        {sections.map(({ id, label }, index) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={active === id ? "location" : undefined} onClick={() => setActive(id)}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
