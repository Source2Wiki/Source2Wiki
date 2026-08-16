/**
 * The plumbing both entry points in \tools share: finding the wiki, generating once, and
 * regenerating whenever an override is edited.
 */

import fs from "node:fs";
import path from "node:path";

import { generateMdxFromJsonDump } from "./generate";
import * as wiki from "./wiki-paths";

/** Points the tools at the wiki, defaulting to the folder npm ran them from. */
export function resolveWikiRoot(root?: string): string {
  const resolved = path.resolve(root ?? process.cwd());

  if (!fs.existsSync(path.join(resolved, "docusaurus.config.ts"))) {
    console.log(`'${resolved}' is not a docusaurus project, this should be the folder containing the docusaurus.config.ts file.`);
    process.exit(1);
  }

  wiki.setWikiRoot(resolved);

  return resolved;
}

export function generate(): boolean {
  try {
    generateMdxFromJsonDump();
    return true;
  } catch (error) {
    console.log(`\nFailed to update MDX files, error: \n${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

export function watchOverrides(): void {
  const overridesFolder = wiki.toDisk(wiki.OverridesFolder);
  let pending: ReturnType<typeof setTimeout> | undefined;

  console.log(`\nWatching for file changes in '${overridesFolder}'`);

  fs.watch(overridesFolder, (_event, filename) => {
    // editors touch a file several times per save, so let the changes settle first
    clearTimeout(pending);
    pending = setTimeout(() => {
      console.log(`\nFile '${filename}' changed, updating MDX.`);
      generate();
      console.log(`\nWatching for file changes in '${overridesFolder}'`);
    }, 100);
  });
}
