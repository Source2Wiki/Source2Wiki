import { normalizeAdmonitionOptions } from '@docusaurus/mdx-loader/lib/remark/admonitions';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Admonition setup for the site. These are the keywords the wiki adds, docusaurus keeps its own
 * (note, tip, info, warning, danger and friends) on top. `legacy` and `nonFGD` are rendered by
 * the components in \src\theme\Admonition.
 */
export const admonitions = {
  keywords: ['legacy', 'nonFGD', 'todo', 'bug'],
  extendDefaults: true,
};

/**
 * Every keyword docusaurus will actually render, ours plus the ones it ships with. The entity
 * page generator checks annotations in \fgd_dump_overrides against this, so an override can
 * only ask for an admonition the site knows how to draw.
 */
export const admonitionKeywords: readonly string[] = normalizeAdmonitionOptions(admonitions).keywords;
