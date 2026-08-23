Something I ran into this week that I think is worth knowing about.

My machine ran out of resources and I had to reboot it. So I took four screenshots of Activity Monitor, handed them to an agent, and typed one word: fix.

It did a good job. It traced the process tree, found connector processes that had outlived the clients that started them, rewrote the configs, and reported back with before-and-after numbers.

A day later, twenty-two of those connector processes were still running. Every one of them reads `enabled = false` in config.

Here is the part I did not expect: nothing had failed.

A config flag decides what starts next time. It has no reach into what is already running. That is all a flag is.

And every piece around it was behaving correctly too. One agent client will not kill another client's processes, which is the right call — a tool that kills things it did not start is a worse tool. The sessions holding those processes were four terminal tabs I had left open overnight, which is not a leak by any definition the system uses. It is just a tab.

So: correct behavior at every step, and a pile in the middle that belongs to nobody.

This is the third time I have hit this exact shape. First it was git worktrees — fifty-two of them, 74 GB, invisible because the directory is ignored so they never show up in `git status`. Then browser automation profiles, same story, same order of magnitude. Now connector processes.

Each one I found the same way, which is to say I did not find it. Something ran out. A full disk. A reboot.

What links them is not sloppiness. It is that handing work to an agent leaves things behind, and nothing in the loop is responsible for ending them. The agent finishing and the leftovers going away are two different events, and only the first one is visible.

The check that would have caught it is cheap, and it is one line:

ps -eo pid,etime,rss,command | grep -iE '(mcp|context7|playwright|chrome-devtools)'

What is running, next to what the config claims. On my machine those two numbers had been disagreeing for a day, and nothing anywhere told me. I wrote a longer version that reports the ratio of connector processes to loaded sessions and redacts the API keys sitting in those command lines — it is linked from the post.

https://ninochavez.co/blog/nobody-owns-what-the-agent-leaves-running
