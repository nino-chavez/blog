The closeout receipt I use at the end of an agent session has seven fields. Six of them are records. The last one is a judgment: archive-safe, yes or no.

That field is the whole design, because it is the only one a machine cannot fill in.

The problem underneath it is that a transcript is carrying four jobs at once. Decisions. Verified evidence. Reusable technique. And disposable chronology. Keep the whole file and both storage and retrieval get worse. Delete it blind and you can erase the only copy of a decision that was never written down anywhere else.

So the closeout sorts a session into four destinations before anything gets compressed. Project truth goes to the repository that owns it — the decision, the rule, the current status, the next action. Verified evidence goes where the tests and receipts already live. A reusable method becomes a small recipe, but only when the method will actually recur. Chronology stays in the raw transcript, kept only while it still carries value.

Three things look like completion and are not. An agent's inference is not a project decision. An agent's summary does not make a human review complete. And a current ingestion watermark proves ingestion, not that any meaning moved.

Which is why archive-safe: no counts as a successful run. It means the closeout found a real gap instead of hiding it behind a green check.

The automation around it stays deliberately boring. A session-end hook gets about three seconds, so its entire job is to append an identifier and return. Mining happens later, in a worker. Deletion happens later still, behind a grace window and an explicit yes.

Cleaning up build artifacts is a separate loop with its own trap. A worktree's directory modification time is not evidence that nobody is using it — writing to a file inside it may never touch the root. So liveness gets rechecked immediately before removal, the first version ships as report-only, and deletion never runs with force.

A deletion that succeeds does not prove the safety model. It proves one deletion succeeded.

https://ninochavez.co/demos/applied/session-closeout
