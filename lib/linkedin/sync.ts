/*
  What lastSyncedAt means for a sheet, kept apart from the store so it can be
  tested without the network.

  lastSyncedAt has to mean "the feed is being kept", not "a post exists", or a
  genuinely quiet fortnight reads as a broken integration and the section hides
  itself while nothing is wrong.

  Two ways fill the sheet, and they need different answers:

  - Make writes syncedAt on every run. The newest stamp is the heartbeat, and
    when Make halts it ages past the staleness window and the band hides.
  - A person pastes links by hand and leaves syncedAt empty. There is no sync
    to fail, so a readable sheet is current as of the moment it was read. The
    embeds show their own dates, so an old post is never passed off as new.

  So the heartbeat applies only once any row carries a syncedAt. A sheet with no
  readable rows reports null, which the feed treats as never synced.
*/

type SheetRow = { syncedAt?: string; postedAt?: string };

const parse = (value: string | undefined): number => Date.parse(value ?? "");

export function deriveSyncedAt(rows: SheetRow[], now: Date = new Date()): string | null {
  const heartbeats = rows.map((row) => parse(row.syncedAt)).filter((value) => !Number.isNaN(value));
  if (heartbeats.length > 0) return new Date(Math.max(...heartbeats)).toISOString();

  const kept = rows.some((row) => !Number.isNaN(parse(row.postedAt)));
  return kept ? now.toISOString() : null;
}
