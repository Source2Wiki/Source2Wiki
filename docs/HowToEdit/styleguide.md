---
title: Style guide
description: Writing conventions for wiki pages; structure, wording, linking and media.
sidebar_position: 1
---

Conventions for writing wiki pages. Following them keeps pages consistent with each other and easy to understand.

## Frontmatter

Every page defines `title` and `description`, and optionally `image` for an icon. Keep both short and concise, they are used for social embeds like Discord, and are what Google uses when indexing the page for search results.

A title is a short sentence-case noun phrase naming the thing, not the task. A description is one line ending in a period. Don't add a `#` heading in the body, the title already renders as one.

## Opening a page

The first sentence defines the thing the page is named after, so a reader landing cold knows what they are looking at.

End the intro by scoping the page: say what it does not cover, and link to the page that does. Unless a page is technical in nature, deep internals a normal reader can skip go under a final `## Technical details` section.

## Keep paragraphs short

Don't write large paragraphs. A wall of text is hard to scan, and most readers come to a page looking for one specific detail rather than reading it top to bottom.

Split a long paragraph into a few short ones, or give each part its own section with a heading.

## Write in third person

Narrate the engine as the subject: "the compiler prints no per stage timings by default", not "you will see no timings". Never use "you" when describing a mechanism.

Imperatives only belong in the numbered steps of a setup walkthrough. Never write as "we" or "I".

## Keep the language plain

Write in simple, direct sentences that someone new to Source 2 can follow. Don't overuse punctuation, don't inject personal anecdotes, and don't go on tangents unrelated to the page's topic. If a side topic is worth covering, cover it on its own page and link to it.

## Headings

Headings are sentence case, with no punctuation, links or bold inside them. Every heading needs body text under it, a run of empty headings is a table of contents pretending to be content.

## Prefer headers over tables

Only use a table for genuinely tabular content, like a set of keys with short values. If most cells wants to hold full sentences, the content belongs in sections instead.

Splitting content under `##` and `###` headers makes it easier to read, and every header shows up in the table of contents on the right of the page, so readers can jump straight to what they need. Table rows never appear there.

## Use annotations sparingly

[Annotations](./annotations.md) exist to highlight information that is important, genuinely useful, or easy to miss. Only use them for that.

:::info
A page where every other block is an annotation has no highlights left, they turn into noise and the reader starts skipping them. If the content needs its own heading, it is a section, not an annotation.
:::

## Use software badges

Refer to games and software with [software badges](./software.mdx) rather than bare names:

```md
This addon only works in <Game name="cs2"/>.
```

The badge makes the reference stand out and stays consistent across the wiki, so avoid writing bare names like "CS2" or "Counter-Strike 2" and instead use <Game name="cs2"/>.

## Inline formatting

Anything typed or stored goes in backticks: paths, filenames, extensions, console commands, keys and classnames. Bold marks a term's first definition or a single contrastive word ("the header is **not** counted"), not every UI noun on the page.

Prefer markdown over raw HTML, no `<b>` or `<br/>` spacers. Don't use trailing-space hard breaks, use paragraphs. Don't put decorative `---` rules between sections, headings already separate them.

## Code blocks

Tag a code block with the real language of its content when possible, like `js`, `cpp` or `csharp`. Directory trees, console commands and KeyValues get no tag rather than a wrong one.

## Linking

Link a concept on its first mention, with a relative path including the file extension, and deep-link to the exact section when one exists: `[Workshop packing](../content-mounting.md#workshop-packing)`.

Instead of restating what another page covers, hand off to it: "What an addon contains, folder by folder, is on [Directory layout]". Guides link the entity or file format reference for full keyvalue lists rather than repeating them.

External links go through badges, `<Tool name="github" label="..." link="..."/>`, never a naked URL. Don't link third-party file hosts for downloads, those links rot.

## Images

Screenshots belong in UI walkthroughs, one per step where the step needs it. Pages describing a mechanism or format usually need none.

Alt text describes what the reader should look for, like `![Select Create New Addon, Name, Create]`, never the filename. Keep files small, crop to the relevant part of the screen and compress large captures. Never ship copyable text as a screenshot, use a code block. Delete images no page references.

## Per-game content

Procedures that differ per game use `<GameTabs>` with one underscore-prefixed partial per game, in the order cs2, hla, dota2, steamvr. Partials carry no frontmatter and no headings, they slot under the parent page's section.

When only one or two games differ, a bullet or table row keyed by a game badge reads better than tabs.

## Guides

A guide opens by stating what it achieves, which games it applies to using badges, and any prerequisites, before the first heading. When a guide shows more than one method, it ends by saying which one to prefer.

## Unfinished pages

A stub or known gap carries a `:::todo` stating in a full sentence what is missing, and where to read in the meantime if anywhere. Never publish a page that is only a heading.

## Generated pages

Everything under `docs/Entities` is generated, editing those files by hand gets overwritten. Changes go through override files instead, see [Entity page info](./entity-page-info.mdx).
