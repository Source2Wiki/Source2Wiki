/**
 * `npm start` runs docusaurus but it must also run code to generate and hot reload entity pages.
 *
 * Docusaurus has to inherit this terminal rather than going through a process runner, because
 * rspack wont render its progress bars otherwise.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { generate, resolveWikiRoot, watchOverrides } from "./entity-pages/cli";

const root = resolveWikiRoot();

generate();
watchOverrides();

const docusaurus = path.join(root, "node_modules", "@docusaurus", "core", "bin", "docusaurus.mjs");

if (!fs.existsSync(docusaurus)) {
  console.log(`Could not find docusaurus at '${docusaurus}', run 'npm install' first.`);
  process.exit(1);
}

const server = spawn(process.execPath, [docusaurus, "start", ...process.argv.slice(2)], {
  stdio: "inherit",
});

server.on("error", (error) => {
  console.log(`\nFailed to start docusaurus: ${error.message}`);
  process.exit(1);
});

process.on("SIGINT", () => {});
process.on("SIGTERM", () => {});

// the watcher would otherwise keep this process alive after the server is gone
server.on("exit", (code, signal) => process.exit(signal !== null ? 1 : (code ?? 0)));
