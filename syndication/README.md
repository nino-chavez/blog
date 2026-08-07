# syndication

Where each published piece goes, in what order, on what date.

```bash
node syndication/build-queue.mjs --due       # what is owed in the next 14 days
node syndication/build-queue.mjs --report    # tallies, writes nothing
node syndication/build-queue.mjs             # rewrite queue.json
node syndication/build-queue.mjs --refresh   # re-pull the Substack archive first
```

## Nothing here is scheduled

**No cron entry, no launchd job, no daemon.** The dates in `queue.json` are a
plan; every post is a command someone runs. Verified, not assumed — and worth
restating because a file full of future dates reads like a schedule.

The one durable piece is the browser-box container (`restart=unless-stopped`),
which returns whenever Docker Desktop runs. Docker itself does not auto-start
here, so nothing survives a reboot unattended.

`--due` exists because of that. A queue you have to remember to open is the same
as no queue, so it answers "what do I owe" in one command and flags any LinkedIn
slot whose caption is still unwritten — which is the actual bottleneck, not the
posting.

Automating delivery is a separate decision and not an obvious yes. Every bug
this pipeline has had — canonical URLs pointing at 404s, 40 already-shared
pieces queued to go out again, dead slugs — surfaced because a person was
looking at the output. dev.to is the reasonable candidate for unattended runs:
verbatim existing writing, canonical-linked, low stakes. A personal LinkedIn
timeline is not.

`queue.json` is the ledger. Re-running preserves every `posted` mark and
reschedules only what has not gone out, so new writing joins the drip without
disturbing what already shipped.

**`--refresh` drives the logged-in browser, and that is not incidental.**
Substack's *public* archive endpoint omits bulk-imported posts entirely — it
reported 23 posts against a real 191, because an earlier RSS import brought the
2025 back catalogue in and none of it appears there. Building on the public
number re-queued about 130 essays that were already live. Only the
authenticated dashboard endpoint tells the truth, so refresh needs a
`browser-box` signed into Substack:

```bash
browser-box start --profile social
BROWSE_PORT=9400 node syndication/build-queue.mjs --refresh
```

Run it after posting to Substack by hand. `substack-archive.json` caches the
result so ordinary runs work offline, and entries already marked `posted`
survive regeneration — so a stale cache can only mis-queue something published
since the last refresh.

## What there is to work with

`--report` prints the current counts. Numbers are deliberately not repeated
here — they move every time Nino publishes, and a README that restates them
starts lying quietly. What holds regardless:

**Substack already holds the back catalogue.** A bulk RSS import brought the
2025 archive across, so the publication carries the great majority of the older
essays — it is not a thin publication waiting to be filled. What it is missing
is 2026 material and the evergreen collections: whitepapers, tutorials, demos,
fiction, counterpoints. That is what the drip is for, and it is why the Substack
queue is a fraction of the LinkedIn one.

Roughly forty of the posts on Substack have no matching blog piece by title.
Some are genuinely Substack-only; some are import artifacts (a few titles came
across with doubled apostrophes). Neither hurts — an unmatched Substack post
simply never appears in the queue — but it means the Substack side is not a
clean mirror of the blog and should not be treated as one.

**LinkedIn history is recoverable after all.** This was recorded here as
unrecoverable, and that was wrong — it confused two different things. `source:
linkedin` marks the 34 articles imported *from* Pulse, which are already there
and must never go back. It says nothing about blog posts *shared to* LinkedIn as
links. Those are readable: every link-share renders a preview card carrying the
linked page's title, so the activity feed is the record.

Harvested into `linkedin-shares.json`, which `build-queue.mjs` reads the same
way it reads the Substack archive. It found 40 pieces already shared that the
queue was about to send again.

**Re-harvesting is not a simple scroll**, and getting it wrong under-reports
silently:

1. Open `linkedin.com/in/<handle>/recent-activity/shares/` in the signed-in box.
2. Install a harvest function that reads every post currently in the DOM into an
   accumulator keyed by LinkedIn's own "Feed post number", skipping ones already
   seen.
3. Scroll **by viewport** (~700px, ~400ms apart), harvesting after every step,
   and click "Show more" whenever it appears.

Step 3 is the whole trick. **The feed is virtualised** — it recycles DOM nodes
as you scroll, so scrolling to `document.body.scrollHeight` and then reading the
page returns whatever survived, not the history. That approach reported 54 posts
out of 231 and looked complete. Incremental scrolling with a harvest at each
step got all 231.

Reposts of other people's content are excluded (`reposted this` in the header);
a share of your own writing is what counts.

## Routing

Length and form decide the platform. Long argument reads as an essay and
belongs where people sit down. Short argument reads as a post and belongs in a
feed. A technique with steps belongs where practitioners search for it.

Values in the table are the `mode` strings a runner will read off `queue.json`.

| Piece | Substack | LinkedIn | dev.to |
|---|---|---|---|
| Whitepaper | `full` | `teaser` | — |
| Counterpoint | `full` | `teaser` | — |
| Tutorial | `full` | `teaser` | `canonical` |
| Demo | `link` — framing note + link | `native` | — |
| Applied companion | — the demo carries the story | `native` | `canonical` |
| Essay ≥1500w | `full` | `teaser` | — |
| Essay 800–1500w | `full` | `native` | — |
| Essay <800w | — too thin to carry an issue | `native` | — |
| Fiction | `full` — serialized run | — wrong register | — |
| Presentation | — deck, not prose | `link` | — |
| Series index, research note | — | — | — not standalone reader content |

`full` means the body goes across. `teaser` means a written lead-in plus a link
home. `native` means the piece is rewritten as a post that stands alone in the
feed. `canonical` means a full cross-post with `canonical_url` pointing at the
blog. `link` means a short framing note around a link, for pieces with no
markdown body to send.

Two rules are doing most of the cutting:

**Anything that originated on LinkedIn never returns to LinkedIn.** Obvious,
and easy to get wrong from a bulk export. Enforced once for every piece rather
than per branch — all 34 imported Pulse articles sit in `blog` today, and a
guard that only covered the essay path would hold now and fail silently the
first time one landed in another collection.

**Essays age out at 12 months.** Routing everything put two and a half years of
material in front of LinkedIn, which means the tail never ships and the head
competes with whatever gets written next. Commentary written against a moment
stops earning a reader's time long before it stops being worth hosting. An aged
essay still goes out if it was flagged `featured` or runs past 1500 words.
Nothing outside the `blog` collection ages at all: a whitepaper, tutorial, demo,
or piece of fiction is evergreen by form.

The horizon is what turns a backlog into a queue — roughly eighteen months of
LinkedIn at two a week, rather than a list nobody reaches the end of.

## Cadence

| Platform | Slots | Why |
|---|---|---|
| LinkedIn | Tue, Thu | Two a week is the most a personal feed absorbs before it reads as automated |
| Substack | Sun | An inbox punishes more than a feed does |
| dev.to | Wed, fortnightly | Slow backfill; the canonical URL points home, so this is SEO, not reach |

Order is tier, then newest, then **interleaved by collection**. Straight
tier-then-date put twelve demos in consecutive slots — six weeks of one format,
which reads as a bot emptying a folder. Round-robin keeps each series in its
own running order while varying what a reader sees week to week.

Tier is a running order, not a quality score. Edit `tier` or set a route's
`state` to `skip-manual` in `queue.json` and regeneration will respect it.

## Other platforms

**dev.to — wired, and the only addition worth making now.** It has a real
publishing API keyed by a token rather than an OAuth app review, and it accepts
`canonical_url`, so the blog keeps the SEO while the piece reaches people who
search there. Tutorials and applied companions are exactly its native content.
Verified only that `dev.to/api/articles` answers; the auth flow has not been
exercised.

**Bluesky — cheap if short-form reach is wanted, not wired.** AT Protocol is
open, auth is an app password, no approval process
(`bsky.social/xrpc/com.atproto.server.describeServer` answers). The AI and
engineering audience is real but smaller than LinkedIn's. It is a third channel
to feed, which is the actual cost.

Rejected, with reasons: **Medium** overlaps LinkedIn's audience with worse
reach and asks for the same effort. **Hashnode** does the same job as dev.to and
its GraphQL endpoint did not answer a plain probe. **Hacker News and Reddit**
are not drip platforms — they are one-shot per strong piece, and a scheduled
cadence into either gets read as self-promotion and punished. **YouTube** would
be the strongest addition for the demo series, and there is no video to post.

## Posting to dev.to

The one channel that runs end to end today, because it needs no new prose — the
tutorial's own markdown goes across with `canonical_url` pointing home.

```bash
node syndication/post-devto.mjs --dry --all   # what would go, in order
node syndication/post-devto.mjs               # everything due today or earlier
node syndication/post-devto.mjs --limit 1 --draft   # one, unpublished, review on dev.to first
```

The key is `op://Developer Secrets/dev.to blog/credential`, read at run time.

`--draft` records `state: "draft"` rather than `posted`, and the queue preserves
it — a draft already exists on dev.to, so letting it fall back to `eligible`
would post a duplicate on the next run.

**A dev.to draft has no public page.** The URL the API returns for one is a
`temp-slug-<n>` placeholder that 404s even for the author — only `<url>/edit`
opens, and only while signed in. Drafts therefore record the edit URL, plus
`articleId`, which is the durable key: publishing rewrites the slug.

Publishing happens on dev.to, so tell the ledger afterwards:

```bash
node syndication/post-devto.mjs --sync   # draft -> posted, with the real URL
```

Without it the queue keeps saying `draft` for something that has been live for
weeks, and the stored edit URL points at a slug that no longer exists.

`--sync` reads `/api/articles/me/published` and matches on `articleId`. Do not
ask `/api/articles/{id}` and test `a.published`: that endpoint omits the field
entirely and signals status through `published_at`, so the test reads false on a
live article — it reported a published post as still a draft on the first run.

`--show` prints what would actually be sent, through the same conversion the
publisher uses, and flags any leftover JSX, relative link or import line. Use it
rather than reimplementing the conversion to check it — that only proves the
copy works.

```bash
node syndication/post-devto.mjs --show              # one line per piece: clean or not
node syndication/post-devto.mjs --show token-waste  # full converted body
```

Four things this handles that are not obvious:

**MDX is converted, not stripped.** Tutorials wrap markdown in `<Exercise>`,
`<Checkpoint>` and `<Template>`, whose props carry real content — an exercise's
number, title and duration are the heading a reader needs. They map to markdown
headings. Any *unmapped* component or leftover import raises rather than posts,
because a half-converted article on someone else's platform is worse than one
that did not go out. The check ignores fenced code blocks, or a shell heredoc
(`<EOF`) reads as an unknown component.

**Site-relative links are made absolute.** `](/blog/…)` resolves against
*dev.to* once the article is over there. Eleven of these sit across the seven
tutorials, all pointing at companion pieces.

**The canonical is checked before publishing.** A `canonical_url` pointing at a
404 is worse for search than sending none. Three URLs in the queue are already
dead from slug drift on the blog:
`/blog/q1-2025-the-integration-quarter`, `/blog/self-service-paradox-revised`,
and the research note, which has no public route at all. The first two were
LinkedIn-eligible and are now `skip-manual` so no runner can reach them — but
that is a stopgap. **The slugs are the actual bug**, and those posts are
presumably dead links anywhere else they were shared. Fix them on the blog and
clear the `skip-manual`.

The pre-flight lives in `post-devto.mjs`. Any future runner needs its own —
the one-request check before publishing is the cheapest guard here, and the
`skip-manual` marks only cover URLs that were dead on 2026-08-03.

**dev.to tags are alphanumeric and capped at four.** A hyphenated
`agentic-systems` is rejected, not cleaned; sanitising alone yields tags nobody
browses. `TAG_ALIASES` in the script maps the handful that have real dev.to
equivalents. Edit that map rather than hand-editing a published post.

Applied companions were routed here at first and should not be: they are
`deck.html` plus `meta.json`, with no markdown body to cross-post. They stay on
LinkedIn.

## Posting to LinkedIn and Substack

Both are browser work — neither has an API credential (`op item list --vault
"Developer Secrets"` has no LinkedIn or Substack item), so both drive the
signed-in composer inside `browser-box` rather than calling an API.

```bash
browser-box start --profile social        # CDP on 9400; survives restarts

node syndication/post-linkedin.mjs --dry --id blog/<slug>   # fill, screenshot, do not publish
node syndication/post-linkedin.mjs --id blog/<slug>
node syndication/post-substack.mjs --dry --id blog/<slug>   # fill a draft, no email
node syndication/post-substack.mjs --id blog/<slug>
```

Both take `--due` for everything scheduled today or earlier. Both borrow
`puppeteer-core` from `browse-tool` rather than adding a dependency here;
`BROWSE_TOOL_HOME` overrides the path.

**Run `--dry` first.** It fills the real composer and screenshots it without
publishing, which is the only way to see what the platform did to the content.
Both refuse to publish if the editor received noticeably less than the source.

Four things that are not obvious, each of which cost a debugging round:

**LinkedIn's editor is inside a shadow root.** `document.querySelector` never
finds it, and neither does an iframe walk — the composer is a `.ql-editor` under
a shadow host, so the selector needs puppeteer's `>>>` piercing combinator. The
"Start a post" button has no stable text or class either (LinkedIn ships
obfuscated class names like `_4c6efdeb`), so the composer opens by deep link:
`/feed/?shareActive=true`.

**Text must arrive as real keystrokes.** Both editors keep their own document
model — Quill on LinkedIn, TipTap/ProseMirror on Substack. Assigning
`textContent` or `innerHTML` leaves that model empty and the publish button
disabled, so LinkedIn goes through `type()` and Substack through a synthetic
`ClipboardEvent` carrying `text/html`.

**Substack destroys pasted tables.** The MCP measurement table in one post
arrived as `ServerToolsBytes of tool schemaTokenschrome-devtools-mcp2923,244` —
one unreadable run, and the editor reported zero tables. Code blocks survive
intact, so `post-substack.mjs` renders every table as aligned monospace inside a
`<pre>` before pasting. This matters more for whitepapers, which use tables
liberally.

**Substack bodies come from the deploy preview, not the apex.** The apex
bot-blocks headless Chrome, so the script lifts the rendered `.prose` block from
`ninochavez-blog.pages.dev` (`BLOG_ORIGIN` overrides). It reads `.innerHTML`
in-page rather than regexing the response, because a regex cannot close the div.

**`--dry` leaves a real draft behind on Substack.** There is no preview that
isn't a draft. Delete them from the drafts list when you are done iterating, or
they accumulate under the post's own title.

Publishing to Substack sends email to subscribers and cannot be unsent. That is
the one action here with no undo; dev.to and LinkedIn posts can both be deleted.

**The logins are done.** As of 2026-08-03 the `social` box is signed into
LinkedIn, Substack and dev.to, and that survives restarts. A future one is the
same drill: sign in inside the box, leave it running ~30s so Chrome commits the
cookies.

**Most captions are unwritten.** Four exist, covering LinkedIn through
2026-08-13. Every other `native` and `teaser` item needs copy.

Captions live at `captions/<platform>/<collection>--<slug>.md`, one file each.
They are prose, they get edited, and `queue.json` is regenerated on every run —
so the file is the artifact and the queue only records the path. An item with a
caption shows `caption:` on its route; one without does not.

Writing them is a writing task, not a syndication task. Load
`docs/signal-dispatch-voice-guide.md` first — the terminal voice is not the
prose voice, and drafting from the wrong one produces generic
thoughtful-LinkedIn cadence. Two rules do the most work: never invent a person,
conversation, or internal admission that did not happen, and gloss any coined
term the first time so a reader outside the project can picture it.

The four written so far run 245–310 words at roughly 11-word average sentences,
which is the corpus fingerprint. Worth checking new ones against the guide's
retired-phrase list mechanically rather than by eye — those phrases were
authentic once and now read as templated.

## A note on "ways of working"

`nc-demos` publishes as **"ways of working — a demo series"**, and that is what
is routed here: 12 demos and 8 applied companions, the strongest LinkedIn
material in the corpus because each one is a real session with a real failure in
it. Each demo's `meta.json` already carries `hook` / `for` / `get` / `do` — the
copy the piece uses to sell itself — and `build-queue.mjs` carries that through
to the queue as `pitch`, so caption drafting starts from existing words rather
than a fresh summary.

The private operator docs under `~/.dotfiles/ways-of-working/` are a different
thing and are deliberately not routed. Publishing from them means deriving new
prose from private notes, which is writing, not syndication.
