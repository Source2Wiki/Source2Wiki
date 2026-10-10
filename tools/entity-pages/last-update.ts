/**
 * Commits per entity, from its dump and override files. The generated docs are not tracked,
 * so docusaurus can't get this from git itself; the docs carry the newest one as `last_update`
 * front matter and all of them as `edit_history` (see tools/page-history.ts).
 */

import { execFileSync } from "node:child_process";
import path from "node:path";

import { GitLogFormat, PageEdit } from "../page-history";
import * as wiki from "./wiki-paths";

/** Entity class -> every commit touching its dump or any of its overrides, newest first. Empty outside a git checkout. */
export function loadEntityHistories(): Map<string, PageEdit[]> {
  const histories = new Map<string, PageEdit[]>();

  let log: string;
  try {
    // leaving exact renames out keeps the move under dump/ from counting as an
    // update to every entity, the legacy folders keep the history from before it
    log = execFileSync("git", ["log", "-M100%", "--diff-filter=AMD", GitLogFormat, "--name-only", "--", wiki.DumpFolder, wiki.OverridesFolder, ...wiki.LegacyDumpFolders], {
      cwd: wiki.getWikiRoot(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    console.log("No git history, entity docs will not carry last update info");
    return histories;
  }

  let commit: PageEdit | null = null;
  for (const line of log.split("\n")) {
    if (line.startsWith("\0")) {
      const [, hash, date, author, message] = line.split("\0");
      commit = { hash, date, author, message };
    } else if (line.endsWith(".json") && commit !== null) {
      // dump/fgd/{class}.json, dump/fgd_overrides/{class}.json or {class}-{game}.json
      const entityClass = path.parse(line).name.split("-")[0];
      const edits = histories.get(entityClass) ?? [];
      // a commit can touch several of an entity's files, it's still one edit
      if (edits[edits.length - 1] !== commit) {
        edits.push(commit);
      }
      histories.set(entityClass, edits);
    }
  }

  return histories;
}
