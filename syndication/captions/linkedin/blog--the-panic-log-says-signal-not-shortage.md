My laptop died at 10:55 in the morning, in the middle of a run, with three heavy jobs going at once that I had started myself.

Losing the run cost about twenty minutes. Writing down why it died cost more.

I wrote that the machine ran out of memory and that the crash log proved it. Clean story, and the numbers backed it: one process was holding 29.1 GB on a 36 GB machine.

The crash log says something else. Apple publishes the file that decodes it, and reading that file took less time than writing the wrong sentence had. The mechanism I had named — the one that kills processes when memory runs short — is not in the log at all. Something else took the machine down, and I still can't say what caused it.

So the note sitting in my research log was a hypothesis wearing the clothes of a finding. That is the expensive part. Not the crash, which cost twenty minutes. The confident sentence about the crash, sitting in the log I rely on to tell me what happened.

Recovery was cheap for unglamorous reasons that predate the crash by months. Every run writes down what it expects before it starts, and every input is pinned to a recorded hash, so checking what survived was a comparison rather than a judgment call. The only real casualties were a launch script and its log, which I had parked in /tmp — the one place I put anything the operating system is allowed to erase without asking.

The check that would have saved me is the boring one: when a log hands you a number, look the number up before you translate it. The plausible reading and the real one were two different readings, and nothing in the file flagged the difference.


--- first-comment ---
https://ninochavez.co/blog/the-panic-log-says-signal-not-shortage
