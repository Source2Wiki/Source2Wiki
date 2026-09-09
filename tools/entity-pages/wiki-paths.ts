/**
 * Helpers for paths that live inside the wiki. Port of WikiPaths.cs.
 *
 * Anything written into a JSON dump or an MDX page is a *wiki path*: relative to the wiki
 * root and always separated with '/', because docusaurus ends up serving it as a URL.
 * node's path.join must never build one of these, on windows it produces '\' which then
 * lands verbatim inside an href.
 *
 * Disk paths are derived from a wiki path only where we actually touch the filesystem,
 * URLs only where we write markup.
 */

import fs from "node:fs";
import path from "node:path";

export const DocsFolder = "docs/Entities";
export const PagesFolder = "src/pages/Entities";
export const DumpFolder = "dump/fgd";
export const OverridesFolder = "dump/fgd_overrides";
/** Entity icons and the entity index live under static, served from the site root as /fgd_dump. */
export const StaticDumpFolder = "fgd_dump";
/** Where the dumps lived before moving under dump/, so git history from before the move still counts. */
export const LegacyDumpFolders = ["fgd_dump", "fgd_dump_overrides"];

const StaticFolder = "static";

let wikiRoot = "";

export function setWikiRoot(root: string): void {
  wikiRoot = root;
}

export function getWikiRoot(): string {
  return wikiRoot;
}

export function combine(...segments: string[]): string {
  return segments
    .filter((segment) => segment.length > 0)
    .map((segment) => trimSlashes(segment.replaceAll("\\", "/")))
    .join("/");
}

/** Absolute path on this machine for a wiki path. */
export function toDisk(wikiPath: string): string {
  return path.join(wikiRoot, ...wikiPath.split("/"));
}

export function exists(wikiPath: string): boolean {
  if (wikiPath.length === 0) {
    return false;
  }

  return fs.statSync(toDisk(wikiPath), { throwIfNoEntry: false })?.isFile() ?? false;
}

/**
 * Site URL for a wiki path. Docusaurus serves \static from the site root, so that
 * segment gets dropped.
 */
export function toUrl(wikiPath: string): string {
  let url = wikiPath.replaceAll("\\", "/").replace(/^\/+/, "");

  if (url.toLowerCase().startsWith(`${StaticFolder}/`)) {
    url = url.slice(StaticFolder.length + 1);
  }

  return `/${url}`;
}

function trimSlashes(segment: string): string {
  return segment.replace(/^\/+/, "").replace(/\/+$/, "");
}
