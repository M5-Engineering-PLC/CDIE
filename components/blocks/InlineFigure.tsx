// Block. changes-v2 item 13: photographs punctuating a long description.
// The caption describes what is visible in the frame, never what it stands for.

import Image from "next/image";

export type InlineFigureProps = {
  src: string;
  alt: string;
  caption?: string;
  /** a wide crop sits between paragraphs; a tall one beside them */
  ratio?: "wide" | "square";
};

export function InlineFigure({ src, alt, caption, ratio = "wide" }: InlineFigureProps) {
  return (
    <figure className="my-8 md:my-10">
      <div className={`relative overflow-hidden border border-line bg-raise ${ratio === "wide" ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
        <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 62rem" className="object-cover" />
      </div>
      {caption ? <figcaption className="mt-2 text-fine text-ink-3">{caption}</figcaption> : null}
    </figure>
  );
}
