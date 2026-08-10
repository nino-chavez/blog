The top entry in my agent's character sheet is a sentence I never typed.

It sits at position one under "red lines — what Nino rejects," which is the section a model reads to learn what I push back on. The line is a deny message from a hook I installed months ago. The miner found it in 117 separate sessions and ranked it first.

The pipeline behind that file reads my own agent transcripts and distills them. On this machine: 1,209 transcripts, four gigabytes, compressed into a seventeen-kilobyte character sheet carrying 2,308 signals from 780 sessions across 106 project folders.

Hook feedback is delivered into a transcript as a user turn. Structurally it is indistinguishable from me talking, and the miner cannot tell them apart. That single message contributed 234 rows — two different regexes each caught a piece of it, so 117 were filed as a correction and 117 as a rejection. One in ten signals in the whole corpus is that string.

Strip it and the correction bucket drops from 245 to 128. Half the record of me correcting an agent is the harness correcting itself.

The most useful thing the pipeline surfaced is not what it was built to find. Approval is the largest bucket by count, 972 of them, and 953 are ten characters or shorter. `go` in 230 sessions, `proceed` in 207, `next` in 158. Mean length across that bucket: nine characters. Rejections average 627 characters. Stated reasons average 731.

By count the corpus is mostly approval. By content, approval is nearly empty. Everything that carries information is in the refusals.

Then the taxonomy. Seven labels exist for corrections, and one test — for a message that opens with a negating word — carries 184 of 245. The label for the diagnostic question, which a separate audit found to be the primary instrument in five of six real corrections, fires nine times.

Nothing here is broken. The regex does exactly what it says. It produces a ranking of matchability, and that gets read as a ranking of importance.

It stays loaded for one reason, which is that I can check it. The extractor is public and every number above sits one SQL statement from the database that produced it. The contamination was findable in an afternoon by a query anyone could write. Set that against what it replaced: a prose voice guide, confident, unqueryable, and wrong until an audit went looking.

The red lines still open with a hook quoting my own rule back at me.

https://ninochavez.co/blog/the-loudest-voice-in-my-voice-corpus-isnt-mine
