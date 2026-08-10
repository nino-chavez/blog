Chrome DevTools MCP loads about 18,000 tokens of schema into an agent's context before any work starts. Playwright MCP, about 13,700. Every conversation, whether or not the browser is ever touched.

That is a fixed cost paid in attention, not just money. The more boilerplate sitting in the window, the worse the reasoning gets at the margins.

So the browser became ten shell commands and a README the agent reads only when it needs to. 724 lines, four dependencies. Small enough to rebuild in an afternoon, which is the point — it is a pattern to own rather than a product to adopt.

The bet is that an agent does not need a protocol for a browser action, because it already has two deep skills: running shell commands and writing JavaScript against the DOM. One command takes arbitrary JS and returns JSON, so every DOM skill the model already has just works. No schema teaches it what a querySelector is.

Four design choices did most of the work. Each project gets a persistent Chrome profile seeded once from the real one and never modifying it, so logins survive and the agent operates authenticated without ever seeing a credential. Commands print paths, not blobs — a screenshot costs nothing until something opens it. One long-lived browser holds all the state while every command stays a quick connect-act-exit, so anything composes with anything. And the tool grows one verb at a time; the git history shows screenshot, markdown, and crawl each landing the week a real session needed them.

Two of its most useful moves hand control back to a person. A picker command lets the human click the element and hands the agent back a selector, which beats guessing at brittle ones. And OTP prompts and CAPTCHAs are deliberately not automated. They exist to verify a human, so the human logs in once and the profile keeps the session.

The honest limit showed up while this very site was being built. The agent recalled a command's shape from memory and passed an output path where the URL belongs. Instant failure. Read the README fresh — the tool changes and the memory doesn't.

MCP still wins where you cannot put a binary on a PATH, or where a team needs managed auth and central policy. This bet assumes you own the machine.

https://ninochavez.co/demos/browse-tool
