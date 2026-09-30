/*
  Review 2026-09-30: "media / from our community section - pick only text as
  caption so that no emojis are included", and hashtags go with them.

  A post's words are kept as written; what is removed is decoration:
  pictographs and the joiners, skin tones, variation selectors, keycaps and
  flag letters that build them, and hashtags. A run of hashtags ending a line
  is dropped whole. A hashtag standing in a sentence ("a week at #CDIE, ...")
  is a word the sentence needs, so only its # goes. Line breaks survive, since
  the first line is what the card uses as a headline, and each line is tidied
  of the doubled spaces a removed emoji leaves behind.

  Node built-ins only, so the tests can import it with type stripping.
*/

const PICTOGRAPHS =
  /\p{Extended_Pictographic}|\p{Regional_Indicator}|[\u{1F3FB}-\u{1F3FF}\u{E0020}-\u{E007F}‍︎️⃣]/gu;
const TRAILING_TAGS = /(?:[ \t ]*#[\p{L}\p{N}_]+)+[ \t ]*$/gmu;
const INLINE_TAG = /(^|\s)#([\p{L}\p{N}_]+)/gu;

/** The post's text with emoji and hashtags removed, and its spacing tidied. */
export function captionText(text: string): string {
  return text
    .replace(PICTOGRAPHS, "")
    .replace(TRAILING_TAGS, "")
    .replace(INLINE_TAG, "$1$2")
    .split("\n")
    .map((line) => line.replace(/[\s ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
