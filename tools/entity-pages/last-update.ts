/**
 * Last commit per entity, from its dump and override files. The generated docs are not tracked,
 * so docusaurus can't get this from git itself; the docs carry it as `last_update` front matter.
 */

import { execFileSync } from "node:child_process";
import path from "node:path";

import * as wiki from "./wiki-paths";

export interface LastUpdate {
  /** ISO 8601. */
  date: string;
  author: string;
}

/** Entity class -> newest commit touching its dump or any of its overrides. Empty outside a git checkout. */
export function loadLastUpdates(): Map<string, LastUpdate> {
  const updates = new Map<string, LastUpdate>();

  let log: string;
  try {
    log = execFileSync("git", ["log", "--format=%x00%aI%x00%an", "--name-only", "--", wiki.DumpFolder, wiki.OverridesFolder], {
      cwd: wiki.getWikiRoot(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    console.log("No git history, entity docs will not carry last update info");
    return updates;
  }

  // newest first, so the first commit an entity shows up in is the one we keep
  let commit: LastUpdate | null = null;
  for (const line of log.split("\n")) {
    if (line.startsWith("\0")) {
      const [, date, author] = line.split("\0");
      commit = { date, author };
    } else if (line.endsWith(".json") && commit !== null) {
      // fgd_dump/{class}.json, fgd_dump_overrides/{class}.json or {class}-{game}.json
      const entityClass = path.parse(line).name.split("-")[0];
      if (!updates.has(entityClass)) {
        updates.set(entityClass, commit);
      }
    }
  }

  return updates;
}
