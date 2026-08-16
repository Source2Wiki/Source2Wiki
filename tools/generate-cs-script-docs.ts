/**
 * Regenerates the cs_script API tables from the copy of `point_script.d.ts` in \cs_script_dump.
 *
 *   npm run generate-cs-script-docs
 *
 * To pick up API changes, copy the file over from CS2 first, it lives at
 *
 *   <steam>\steamapps\common\Counter-Strike Global Offensive\content\csgo\maps\editor\zoo\scripts\point_script.d.ts
 *
 * The tables are written as a partial that the API documentation page imports, so nothing has to
 * be pasted anywhere and the page itself stays hand written. Docusaurus ignores files starting
 * with an underscore, so the partial never becomes a page of its own.
 */

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import { parseApi, renderApi } from "./cs-script/api-docs";

const DumpFolder = "cs_script_dump";
const ScriptTypes = "point_script.d.ts";
const GamePath = String.raw`<steam>\steamapps\common\Counter-Strike Global Offensive\content\csgo\maps\editor\zoo\scripts`;
const Partial = ["docs", "Scripting", "Counter-Strike 2", "cs_script", "_apiTables.mdx"];

const { values } = parseArgs({
  options: {
    root: { type: "string" },
    out: { type: "string" },
  },
});

const root = path.resolve(values.root ?? process.cwd());

if (!fs.existsSync(path.join(root, "docusaurus.config.ts"))) {
  console.log(`'${root}' is not a docusaurus project, this should be the folder containing the docusaurus.config.ts file.`);
  process.exit(1);
}

const input = path.join(root, DumpFolder, ScriptTypes);

if (!fs.existsSync(input)) {
  console.log(`'${input}' is missing, copy it there from '${GamePath}'`);
  process.exit(1);
}

const output = values.out === undefined ? path.join(root, ...Partial) : path.resolve(values.out);

fs.writeFileSync(output, renderApi(parseApi(input, fs.readFileSync(input, "utf8"))), "utf8");

console.log(`Wrote '${output}'`);
