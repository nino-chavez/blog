Two announcements landed three days apart. Google previewed WebMCP in Chrome on the tenth. GitHub shipped agentic workflows in technical preview on the thirteenth.

Both are about letting agents do things, and they answer the underlying question in opposite ways.

GitHub's is the explorer model. Write a workflow in plain Markdown, hand the agent broad repo access, let it find the path. It reads, navigates, reasons about structure, and proposes an approach.

Google's is the opposite impulse. Websites publish a manifest of callable tools through a browser API. Don't make the agent squint at your DOM; give it a typed interface and get out of the way.

The instinct is to pick a side. Loose is creative; tight is boring but safe.

I don't think that's the real distinction. It's whether the domain rewards exploration or punishes it. A repository is a densely linked graph — files reference files, tests describe behavior, commit history tells a story. The information density supports reasoning. A payment gateway is not that, and you don't want an agent exploring checkout. You want one function called with exactly the right parameters.

The clean binary collapses almost immediately anyway. GitHub's workflows run on MCP underneath. WebMCP still needs a reasoning model to decide which tool and when. They're innovating on different layers, discovery versus execution, not competing on one.

Which makes the shape obvious in retrospect. A loose agent orchestrating tight tools. Microservices reframed, except the coordinator has a language model where the state machine used to be.

I've been building for the tight side almost reflexively — cages, constraints, narrow views.

I'm no longer sure that's right.


--- first-comment ---
https://ninochavez.co/blog/two-doors-for-agents
