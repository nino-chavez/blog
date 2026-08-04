I installed a thing to make my READMEs prettier. This is the kind of job you hand to a machine when you don't want to think. Nicer headings. A banner. Make it look like someone cared. I pointed it at five of my own repositories.

It barely touched the design. What it did instead was read the code and start telling me the documentation was lying.

The first README says the project deploys to one platform. The config has said a different one for months. Nobody had noticed, because why would you. A README is written once and then trusted indefinitely, which is exactly what makes it the most confident liar in the repo.

Then the install instructions, which tell you to use one package manager. There's a lockfile sitting in that repo from the other one. There has only ever been a lockfile from the other one. Every command in that guide would send a new person down a path that has never worked. It would take them a while to figure out why, because the document sounds so certain of itself.

Then a count, which is my favorite of these. One README described nine small command-line scripts. The directory holds ten. And the tenth isn't registered in the package manifest, so a global install wouldn't expose it at all. The wrong number was sitting on top of a real packaging bug, hiding it.

Then drift running the other direction entirely. A feature list missing whole capabilities the code had grown since anyone last looked. Photo enrichment through a model API. An ingest pipeline over OAuth. A worker that streams album archives. None of it mentioned anywhere.

A tool named for decoration doing its most valuable work as a diagnostic isn't magic. The reason is unglamorous. Its instructions told it to read the real repository first: check the claim against the thing it describes. The config for a deploy line. The lockfile for a package manager. The dependency list for a feature list.

The failure it produced on me is almost too on the nose. I wrote that the hand-drawn banners would render fine against a dark background, having only ever looked at them locally in a preview app. Never once on the page where they actually ship. I asserted the render and skipped the render.

Five repos, all mine, all one stack family. A project with many contributors could drift in ways this pass never sees. The sample is small and homogeneous.

https://ninochavez.co/demos/beautifier
