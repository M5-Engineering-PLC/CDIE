/* Fix plan 2026-10-11, W3: dates come from the text and the post's own date. */

const MONTHS = "jan feb mar apr may jun jul aug sep oct nov dec".split(" ");
const MONTH = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const DAY = "(\\d{1,2})(?:st|nd|rd|th)?";
const YEAR = "(?:[ ,]+(\\d{4}))?";
const DATES = new RegExp(`\\b(?:${DAY}\\s+(${MONTH})${YEAR}|(${MONTH})\\s+${DAY}${YEAR})\\b`, "gi");
const WEEKDAYS = "sunday monday tuesday wednesday thursday friday saturday".split(" ");

/** @param {string} value */
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** @param {string} postedAt */
export function postDate(postedAt) {
  return Number.isFinite(Date.parse(postedAt)) ? new Date(postedAt).toISOString().slice(0, 10) : null;
}

/** @param {string} text @param {string} postedAt */
export function dateFromText(text, postedAt) {
  const base = postDate(postedAt);
  if (!base) return null;
  for (const match of text.matchAll(DATES)) {
    const day = Number(match[1] ?? match[5]);
    const month = MONTHS.indexOf((match[2] ?? match[4]).slice(0, 3).toLowerCase()) + 1;
    const stated = match[3] ?? match[6];
    let year = Number(stated ?? base.slice(0, 4));
    const at = (y) => `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    /* Review 2026-10-11: with no year given, a date more than about two months
       before the post is the next one ("Join us 5 January" posted in December). */
    if (!stated && validDate(at(year)) && Date.parse(base) - Date.parse(at(year)) > 60 * 86_400_000) year += 1;
    const iso = at(year);
    // Do not normalize an impossible date into a different day or weekday.
    return validDate(iso) ? iso : null;
  }
  const numeric = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (numeric) return validDate(numeric[1]) ? numeric[1] : null;
  const weekday = text.match(/\b(?:(this|next)\s+)?(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b/i);
  if (!weekday) return null;
  const date = new Date(`${base}T00:00:00Z`);
  let offset = (WEEKDAYS.indexOf(weekday[2].toLowerCase()) - date.getUTCDay() + 7) % 7;
  if (weekday[1]?.toLowerCase() === "next" && offset === 0) offset = 7;
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}
