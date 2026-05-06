# ninochavez.co — Positioning Copy

**Status:** draft for review. Delivered as copy blocks, not code edits. Apply to `website-nc` once reviewed.

**Principle behind the edits:** the current site already leans on a useful metaphor — "I build with AI the way I shoot with a camera — reading the moment, finding the signal." That frames reading and selecting as the core act, which is the right frame. The edits below tighten one or two phrases so "builder" can't be misread as "person who types code," and add a single sub-hero line that names the category explicitly.

---

## 1. Hero — primary headline

**Current (approx.):**
> Cut the Noise, Follow the Signal

**Keep.** The signal/noise spine is load-bearing and already differentiated.

---

## 2. Hero — subhead

**Current:**
> AI-native builder. I build with AI the way I shoot with a camera — reading the moment, finding the signal. Chicago.

**Proposed:**
> AI-native architect. I direct the build the way I shoot a frame — reading the moment, selecting the one that holds. Chicago.

**Why the swap:**
- "builder" → "architect" removes the "types code" implication
- "I build with AI" → "I direct the build" names the actual move without being defensive about it
- "finding the signal" → "selecting the one that holds" — "selecting" is the verb from the session; "holds" is doing more work than "signal" in context

**If the camera metaphor is non-negotiable**, the softer edit is just:
> AI-native architect. I work with AI the way I work with a camera — reading the moment, choosing the frame that holds. Chicago.

---

## 3. Sub-hero paragraph (new — directly under the subhead)

> Twenty-five years of enterprise architecture, now compressed. I hold the shape of the system — stack choices, prompt architecture, security posture, deploy surface. Agents type the code under direction. The output ships to real users and survives contact with them.

**Placement:** one short paragraph, 2–4 lines depending on viewport. Lives between the current subhead and the "what I'm building / writing / shooting" tri-split.

**Purpose:** this is the line the 40% needs to see. It names the category without the defensive "I don't type code" framing, and it claims the stakes ("survives contact with real users") the blog post argues are the real measure.

---

## 4. Meta description (og:description, twitter:description, meta description)

**Current:**
> AI-native builder crafting signals from code, cameras, sound, and words. Chicago.

**Proposed:**
> AI-native architect shipping signals from code, cameras, sound, and words. Chicago.

Single word change. "crafting" → "shipping" does two things: shifts from aesthetic verb to outcome verb, and subtly aligns with the blog's "deployed URLs are what matter" thesis.

---

## 5. "Building" card copy

**Current:**
> AI-native software, platforms, and tools. Rally HQ, Signal X Studio, and whatever else I'm tinkering with.

**Proposed:**
> AI-native software shipped at architect leverage. Rally HQ, Signal X Studio, and whatever else is compiling today.

**Why:**
- "architect leverage" is the keeper phrase from the reframe — it names the flex without explaining it
- "tinkering" is a safe word but it undersells; "whatever else is compiling today" signals active build without conceding the category

---

## 6. About page — opening line edit

Check `src/routes/about/+page.svelte` for an opening sentence that begins with "I'm a…" If it says "I'm an AI-native builder," swap to:

> I'm an AI-native architect. The execution layer is agents, not a team. The work still ships.

Three short sentences on purpose. The third one does the load-bearing work — it closes the expected objection before it's raised.

---

## 7. What to NOT put on the portfolio

- Do not add a paragraph explaining why "I don't write code" is a valid position. The portfolio is not the place to argue the case — the blog post is. The portfolio just stands in the new category as though it's obvious.
- Do not list tools used ("Claude Code, Cursor, Antigravity, GPT-5…"). That reads as tooling-bragging and puts the focus back on the typing layer.
- Do not retire the camera metaphor. It pre-dates the reframe and still works — the overlap between "reading the moment and choosing the frame" (photography) and "reading the options and selecting the shape" (agent direction) is real, and is the best piece of poetry the site currently has.

---

## 8. Link strategy

Add a single textual link from the new sub-hero paragraph to the blog post "I Don't Write Any Code" once it's published:

> … survives contact with them. <a href="/blog/i-dont-write-any-code">Here's what that actually means →</a>

This gives visitors who want the argument a place to go, without cluttering the hero with it.
