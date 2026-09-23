/**
 * Warns about `<Convar name="..."/>` links in the docs that point at a console variable which is
 * not in that game's dump, which happens when Valve renames or removes one.
 *
 *   npm run check-convar-links
 *
 * It only warns, a stale link still goes to the console variable list, just without a row to
 * scroll to.
 */

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const docsFolder = path.join(root, "docs");
const convarFolder = path.join(root, "dump", "convars");

const convarsByGame = new Map<string, Set<string>>();

function getConvars(game: string): Set<string> | undefined
{
  if (!convarsByGame.has(game))
  {
    const file = path.join(convarFolder, `condump_${game}.json`);
    if (!fs.existsSync(file))
    {
      return undefined;
    }

    const dump = JSON.parse(fs.readFileSync(file, "utf8")) as { Entries: { Name: string }[] };
    convarsByGame.set(game, new Set(dump.Entries.map(entry => entry.Name)));
  }

  return convarsByGame.get(game);
}

function* walk(folder: string): Generator<string>
{
  for (const entry of fs.readdirSync(folder, { withFileTypes: true }))
  {
    const full = path.join(folder, entry.name);
    if (entry.isDirectory())
    {
      yield* walk(full);
    }
    else if (/\.mdx?$/.test(entry.name))
    {
      yield full;
    }
  }
}

const convarTag = /<Convar\s+([^>]*?)\/>/g;
const attribute = (attributes: string, name: string) => attributes.match(new RegExp(`${name}="([^"]*)"`))?.[1];

let links = 0;
let problems = 0;

for (const file of walk(docsFolder))
{
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
  let inCodeBlock = false;

  lines.forEach((line, index) =>
  {
    if (line.trimStart().startsWith("```"))
    {
      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock)
    {
      return;
    }

    // examples inside inline code are not links
    for (const match of line.replace(/`[^`]*`/g, "").matchAll(convarTag))
    {
      links++;
      const name = attribute(match[1], "name");
      const game = attribute(match[1], "game") ?? "cs2";
      const where = `${path.relative(root, file)}:${index + 1}`;
      const convars = getConvars(game);

      if (!convars)
      {
        console.log(`${where}: no convar dump for game '${game}'`);
        problems++;
      }
      else if (!name || !convars.has(name))
      {
        console.log(`${where}: '${name}' is not in the ${game} convar dump`);
        problems++;
      }
    }
  });
}

console.log(`Checked ${links} convar link(s), ${problems} problem(s).`);
