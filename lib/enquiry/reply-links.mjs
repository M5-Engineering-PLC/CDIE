const SUBJECT = "Re: Website enquiry";
const MAX_URL_LENGTH = 1800;

function quoteMessage(message) {
  return message.trim().split("\n").map((line) => `> ${line}`).join("\n");
}

function buildUrl(provider, email, message) {
  const base = provider === "gmail"
    ? `https://mail.google.com/mail/?view=${encodeURIComponent("cm")}&fs=${encodeURIComponent("1")}`
    : "https://outlook.office.com/mail/deeplink/compose?";
  const address = encodeURIComponent(email);
  const subjectKey = provider === "gmail" ? "su" : "subject";
  const fixed = `${base}${provider === "outlook" ? "" : "&"}to=${address}&${encodeURIComponent(subjectKey)}=${encodeURIComponent(SUBJECT)}&body=`;
  const source = Array.from(message.trim());
  let low = 0;
  let high = source.length;
  let result = `${fixed}${encodeURIComponent(quoteMessage(source.join("")))}`;
  while (result.length > MAX_URL_LENGTH && low < high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = `${fixed}${encodeURIComponent(quoteMessage(source.slice(0, mid).join("")))}`;
    if (candidate.length <= MAX_URL_LENGTH) {
      result = candidate;
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  if (result.length > MAX_URL_LENGTH) result = fixed;
  return result;
}

export function buildReplyUrls(email, message) {
  return { gmail: buildUrl("gmail", email, message), outlook: buildUrl("outlook", email, message) };
}
