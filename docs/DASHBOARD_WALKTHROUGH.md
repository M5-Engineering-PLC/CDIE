# CDIE website dashboard: a one-page walkthrough

Date: 2026-09-25
For: the CDIE team members who will keep the site's content up to date.

## What it is

The dashboard at `/admin` is where you add posts, newsletters, events,
upcoming activities, staff and cohorts. It is part of the website but not of
the public site: no menu links to it, search engines are told not to index
it, and it is reached by typing the address.

Sign-in: when `ADMIN_AUTH` is on you enter the shared password once and stay
signed in for eight hours. Until then the address alone opens it.

## The pages

| Page | What it does |
|---|---|
| Overview | Two status lines (is the Google Sheet connected, is GitHub sync on), the analytics tiles (newsletter subscribers, contact forms, both over 30 days and by month), forms by reason, and a count per section |
| Design Studio | The room model on its own, with the station highlights, the tour and the room dimensions, so the model can be checked without the public page around it |
| Posts | Title, date, summary, photograph, link. Shown on Media |
| Newsletters | Issue label, title, summary, cover image, PDF. The cover is the card; tapping it opens the PDF |
| Events | Title, start and end dates, venue, photograph, summary. Past and future; the calendar on Media reads them |
| Upcoming activities | The same fields as events, for the short list on Programmes |
| Staff | Name, role, portrait, short bio |
| Cohorts | Cohort name, programme, year, summary, photograph |

## Adding a record

1. Open the section from the bar at the top.
2. Fill the form. Required fields are marked. Photographs should be landscape
   and at least 1200 pixels wide; small thumbnails look soft on the site.
3. Watch the preview beside the form: it draws the record exactly as the
   public page will.
4. Save. The record appears in the list below the form. Remove it from the
   same list if it was a mistake.

## Where a save goes, and when the site shows it

```text
Dashboard save
   |
   v
Google Sheet, one tab per section      (the database)
   |                       \
   |                        > GitHub workflow "Sync dashboard content"
   |                          copies the sheet into content/cms-snapshot.json
   |                          and commits it; the host deploys the commit
   v
The site reads the sheet (cached five minutes) and falls back to the
snapshot when the sheet cannot be reached
```

- With the Google Sheet connected, the public page updates within about
  five minutes of a save, and at once after the next deploy.
- With GitHub sync on, each save also triggers the workflow straight away;
  otherwise it runs every hour.
- Without the sheet (a developer's machine), saves go to a local file and
  the site reads the committed snapshot.

Newsletter subscribers and contact-form counts are stored in the sheet too,
on their own tabs, and never copied into the repository.

## Things to know

- Uploaded photographs and PDFs are stored with the record. With GitHub sync
  on they are also committed to the repository so they survive a redeploy.
- Nothing you add here changes the page copy. Headlines, buttons and FAQ
  wording come from the Actual Copy document and are changed in code.
- If the overview says the sheet is not connected, saves are landing on the
  server only. Ask the deployer to set the three Google values from
  `docs/SECRETS_CHECKLIST.md`.
- If a record does not appear on the site after ten minutes, check the
  Actions tab of the repository for the sync workflow's last run.
