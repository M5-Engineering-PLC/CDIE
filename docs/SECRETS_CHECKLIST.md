# CDIE website: credentials and secrets checklist

Date: 2026-09-25
Status: checklist. No value in this file is a secret; every value is set in the
host or in GitHub, never committed.

This answers item 1 of the daily note of 25 September, "credentials and
secrets". It lists every credential the site can use, what it unlocks, who
should own it and where it is set. Items marked `Go-live` must be in place
before the site is public. The others can wait.

## 1. Where secrets live

| Place | Holds | Who sets it |
|---|---|---|
| Vercel project, Environment Variables | Everything the running site reads | Whoever deploys, with the CDIE owner of each account |
| GitHub repository, Settings, Secrets and variables, Actions | The three Google values the sync workflow needs | A repository admin |
| `.env.local` on a developer machine | Any of the above, for a dev server. Git-ignored. | Each developer |

`.env.example` at the repository root is the reference list of names and is
kept in step with this file.

## 2. The checklist

| Go-live | Name | Unlocks | Owner | Where |
|---|---|---|---|---|
| Yes | `NEXT_PUBLIC_SITE_URL` | Canonical links, share cards, robots and sitemap | Deployer | Vercel |
| Yes | `ADMIN_AUTH=on` and `ADMIN_PASSWORD` | Sign-in on `/admin`. Without both, the dashboard is open to anyone with the address (2026-09-22 decision, no login for now) | CDIE studio manager | Vercel |
| No | `ADMIN_SECRET` | Signs the admin session cookie. Defaults to the password; set it so the password can change without signing everyone out | Deployer | Vercel |
| Yes | One of the three contact-form providers below | The contact form actually sends. Until one is set the form shows the team's address instead | Ive (the receiving inbox) | Vercel |
| Yes | Resend, or the Apps Script pair `ENQUIRY_WEBHOOK_URL` and `ENQUIRY_WEBHOOK_SECRET` | The newsletter sends: confirmation links on sign-up and issues from the dashboard. Web3Forms cannot do this, it delivers to one inbox only. Until one is set, sign-ups are recorded and told so, and the send panel says what to set | Ive | Vercel |
| Yes | `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` | The dashboard writes to and reads from the Google Sheet | Owner of the CDIE website Drive folder | Vercel and GitHub Actions secrets |
| No | `GITHUB_REPO`, `GITHUB_TOKEN` | A dashboard save triggers the snapshot workflow at once and uploads are committed to `public/uploads` | Repository admin | Vercel |
| Yes | `LINKEDIN_SHEET_CSV_URL` | The Media page reads the CDIE LinkedIn feed sheet instead of the stub | Owner of the sheet | Vercel |

## 3. The contact form, free path to a Gmail inbox

The daily note asks how to send the filled contact form to Ive's Gmail without
an email service provider. Three providers are wired in
`lib/enquiry/deliver.ts`; the first one configured is used.

### Option A. Web3Forms, recommended for today

Free tier, no domain, no code. The access key is issued to one inbox and the
form can only deliver there.

1. Open web3forms.com and request an access key, entering Ive's Gmail address.
2. Confirm the address from the email Web3Forms sends.
3. Set `WEB3FORMS_ACCESS_KEY` in Vercel to the key.
4. Send a test through the site's contact form and check the inbox.

Limits: 250 submissions a month on the free tier, which is far above the
enquiry counts the dashboard has recorded. The email arrives from Web3Forms
with the visitor's address in the body, so reply by copying it.

### Option B. Google Apps Script, free and inside Ive's own account

No third party at all. Ive's Google account runs a tiny script that receives
the form and emails it to itself.

1. Signed in as Ive, open script.google.com and create a new project.
2. Replace the contents of `Code.gs` with:

```js
// Contact form: mails the account itself, with reply-to set to the visitor.
// Newsletter: mails the address in "to", but only when the request carries the
// secret stored in this project's script properties (WEBHOOK_SECRET), so the
// web app cannot be used as an open relay by anyone who finds its address.
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var secret = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");
  var trusted = secret && data.secret === secret;
  var message = {
    to: trusted && data.to ? data.to : Session.getEffectiveUser().getEmail(),
    subject: data.subject,
    body: data.text
  };
  if (data.email) message.replyTo = data.email;
  if (trusted && data.html) message.htmlBody = data.html;
  MailApp.sendEmail(message);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Project Settings, Script Properties: add `WEBHOOK_SECRET` with a long
   random value. Set the same value as `ENQUIRY_WEBHOOK_SECRET` in Vercel.
   The newsletter needs it; the contact form works without it.
4. Deploy, New deployment, type Web app. Execute as: Me. Who has access:
   Anyone. Authorise when asked.
5. Copy the web app URL (it starts with `https://script.google.com/macros/`)
   and set it as `ENQUIRY_WEBHOOK_URL` in Vercel.
6. Send a test through the site's contact form, then a test issue from the
   dashboard's newsletter send panel.

Limits: 100 emails a day on a consumer Gmail account. The route refuses any
address that is not on script.google.com, so a mistyped variable cannot turn
the form into a poster to somewhere else.

### Option C. Resend, when CDIE has a domain to verify

Set `RESEND_API_KEY` and `ENQUIRY_FROM` (a sender on a domain verified with
Resend). `ENQUIRY_TO` overrides the default recipient `ive@ku.ac.ke`. Keep this
for when the site is on cdie.co.ke and someone can add the DNS records.

## 4. The Google Sheet credentials

1. In Google Cloud, create a project, enable the Google Sheets API, and create
   a service account. Download its JSON key.
2. Share the CDIE LinkedIn feed sheet with the service account's
   `client_email` as an Editor.
3. Set `GOOGLE_SHEET_ID` (the id in the sheet's `/d/<id>/edit` URL),
   `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` (the `private_key`
   field, newlines included) in Vercel and as GitHub Actions secrets.

The sheet is owned by a personal account today. Move it into a CDIE-owned
Drive before handover so the credentials outlive any one person.

## 5. The published CSV for the LinkedIn feed

In the sheet: File, Share, Publish to web, choose the posts tab, choose
Comma-separated values, publish, and copy the link. Set it as
`LINKEDIN_SHEET_CSV_URL`. It must be a docs.google.com address; anything else
is refused. Setup detail is in `docs/architecture/linkedin-api.md`.

## 6. Rules

- No secret is ever committed. `.env.local` and `.data` are git-ignored.
- One owner per credential, named above, so rotation has a person.
- Rotate `ADMIN_PASSWORD` when anyone with it leaves the team.
- The GitHub token is fine-grained, this repository only, Contents read and
  write, nothing more.
