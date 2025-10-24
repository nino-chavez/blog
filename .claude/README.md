# Claude Code Configuration for Signal Dispatch

This directory contains Claude Code project configuration and slash commands.

## Files

### `claude.md`
**Purpose**: Project-level instructions loaded at the start of every Claude Code session.

**Key Features**:
- Auto-references the voice guide for all content work
- Provides project overview and tech stack info
- Lists common commands and workflows
- Includes voice principles summary

### `settings.local.json`
**Purpose**: Permission settings for approved bash commands (auto-managed by Claude Code).

## Slash Commands

### `/write-post`
**Use when**: Starting a new blog post from scratch

**What it does**:
1. Loads the voice guide automatically
2. Helps identify the hook/tension
3. Suggests appropriate structure template
4. Guides drafting process
5. Generates proper frontmatter
6. Reviews against voice checklist

**Example**:
```
/write-post
I want to write about how I debugged a tricky Svelte state management issue
```

### `/edit-post`
**Use when**: Refining an existing draft

**What it does**:
1. Loads voice standards
2. Reviews against authenticity criteria
3. Checks structural patterns
4. Identifies tonal issues
5. Suggests specific revisions
6. Preserves intentional rough edges

**Example**:
```
/edit-post
[paste draft content]
```

### `/review-voice`
**Use when**: Need a voice consistency audit

**What it does**:
1. Loads complete voice guide
2. Scores post on voice dimensions (1-10)
3. Identifies what's working
4. Flags red flags (corporate jargon, academic tone)
5. Provides specific revision examples

**Example**:
```
/review-voice
[paste draft or link to file]
```

## How It Works

1. **Automatic Loading**: `claude.md` is read at session start
2. **Voice Guide Integration**: All content commands reference `/docs/signal-dispatch-voice-guide.md`
3. **Slash Commands**: Type `/` in Claude Code to see available commands

## Voice Guide Location

**Primary Reference**: `/docs/signal-dispatch-voice-guide.md`

This guide is based on empirical analysis of 156 published posts and defines:
- Opening patterns
- Structural templates
- Sentence-level mechanics
- Quality checklists
- Revision examples

## Maintenance

### When to Update `claude.md`:
- New project patterns emerge
- Tech stack changes
- New workflow conventions
- Additional voice principles

### When to Update Slash Commands:
- New content workflows needed
- Voice guide structure changes
- Common editing patterns identified

### When to Update Voice Guide:
- Quarterly review
- After 50 new posts
- When voice drift detected
- New voice patterns emerge

## Quick Reference

**Writing new post?** → `/write-post`
**Editing draft?** → `/edit-post`
**Voice audit?** → `/review-voice`
**Manual reference?** → Read `/docs/signal-dispatch-voice-guide.md`

---

**Last Updated**: 2025-10-24
**Maintained By**: Signal Dispatch Editorial
