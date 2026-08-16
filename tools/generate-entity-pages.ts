/**
 * Generates entity documentation pages from dumps produced by WikiPageTools.exe and manual overrides in \fgd_dump_overrides. 
 */

import { parseArgs } from "node:util";

import { generate, resolveWikiRoot, watchOverrides } from "./entity-pages/cli";

const { values } = parseArgs({
  options: {
    root: { type: "string" },
    watch: { type: "boolean", default: false },
  },
});

resolveWikiRoot(values.root);

const generated = generate();

if (values.watch) {
  watchOverrides();
} else if (!generated) {
  process.exit(1);
}
