/**
 * Building the wiki's entity pages out of \fgd_dump.
 *
 * Every entity gets one document under \docs\Entities holding the tab strip, and one page per
 * game under \src\pages\Entities holding the page info.
 */

import fs from "node:fs";
import path from "node:path";

import { loadLastUpdates } from "./last-update";
import { bannerTitle, LogVerbose } from "./logging";
import { documentMdx, pageMdx } from "./mdx";
import { EntityDocument, getIconUrl, getPageRelativePath, parseEntityDocumentFile } from "./model";
import { handleOverrides } from "./overrides";
import { sanitizeInputTable } from "./sanitize";
import * as wiki from "./wiki-paths";

interface EntityIndexEntry {
  Classname: string;
  Description: string;
  Icon: string;
  Games: string[];
}

export function generateMdxFromJsonDump(): void {
  console.log();
  console.log(bannerTitle("Generating MDX pages from JSON dump!"));

  const docsDictionary = new Map<string, EntityDocument>();

  console.log();
  console.log(bannerTitle("Loading JSON docs!"));
  const jsonDocs = getFiles(wiki.toDisk(wiki.DumpFolder));
  console.log(`Found '${jsonDocs.length}' JSON doc(s)`);

  console.log();
  console.log(bannerTitle("Loading page overrides!"));
  const overrides = getFiles(wiki.toDisk(wiki.OverridesFolder));
  console.log(`Found '${overrides.length}' page override(s)`);

  console.log();
  console.log(bannerTitle("Reading last update info from git!"));
  const lastUpdates = loadLastUpdates();
  console.log(`Found history for '${lastUpdates.size}' entity(s)`);

  console.log();
  console.log(bannerTitle("Deserialising JSON docs into page docs!"));
  for (const jsonDoc of jsonDocs) {
    if (path.parse(jsonDoc).name === "timestamp") {
      continue;
    }

    const doc = parseEntityDocumentFile(jsonDoc);

    if (docsDictionary.has(doc.Name)) {
      throw new Error(`More than one JSON doc is named '${doc.Name}'!`);
    }

    docsDictionary.set(doc.Name, doc);
  }
  console.log("Finished deserialising");

  console.log();
  console.log(bannerTitle("Handling page overrides!"));
  handleOverrides(overrides, docsDictionary);

  fs.mkdirSync(wiki.toDisk(wiki.DocsFolder), { recursive: true });

  console.log();
  console.log(bannerTitle("Writing out MDX files from classes!"));

  let skippedDocs = 0;
  let wroteDocs = 0;
  let skippedPages = 0;
  let wrotePages = 0;

  // everything this run is responsible for, anything else in those folders is left over
  const generatedDocs = new Set<string>();
  const generatedPages = new Set<string>();

  // write index for search
  const entityIndex: EntityIndexEntry[] = [];

  for (const [docName, doc] of docsDictionary) {
    const docPath = path.join(wiki.toDisk(wiki.DocsFolder), `${doc.Name}.mdx`);
    generatedDocs.add(docPath);

    if (writeFileIfContentsChanged(docPath, documentMdx(doc, lastUpdates.get(docName) ?? null))) {
      wroteDocs++;
      console.log(`Wrote document '${docPath}'`);
    } else {
      skippedDocs++;
      if (LogVerbose) {
        console.log(`Skipped writing document '${docPath}' because the file contents did not change.`);
      }
    }

    const entityIndexEntry: EntityIndexEntry = {
      Classname: docName,
      Description: "",
      Icon: "",
      Games: [],
    };

    entityIndex.push(entityIndexEntry);

    for (const page of doc.Pages) {
      const description = page.Description ?? "";

      if (description.length > entityIndexEntry.Description.length) {
        entityIndexEntry.Description = sanitizeInputTable(description).replaceAll("\n", "<br/>");
      }

      if (page.Game !== null) {
        entityIndexEntry.Games.push(page.Game);
      }

      const iconUrl = getIconUrl(page);
      if (iconUrl !== null) {
        entityIndexEntry.Icon = iconUrl;
      }

      const pagePath = path.join(wiki.toDisk(wiki.PagesFolder), getPageRelativePath(page));
      generatedPages.add(pagePath);
      fs.mkdirSync(path.dirname(pagePath), { recursive: true });

      if (writeFileIfContentsChanged(pagePath, pageMdx(page))) {
        wrotePages++;
        console.log(`\nWrote page '${pagePath}' because file contents changed`);
      } else {
        skippedPages++;
        if (LogVerbose) {
          console.log(`Skipped writing page '${pagePath}' because the file contents did not change.`);
        }
      }
    }
  }

  const removedDocs = removeStaleMdx(wiki.toDisk(wiki.DocsFolder), generatedDocs);
  const removedPages = removeStaleMdx(wiki.toDisk(wiki.PagesFolder), generatedPages);

  const entityIndexPath = wiki.toDisk(wiki.combine("static", wiki.DumpFolder, "entityIndex.json"));

  fs.mkdirSync(path.dirname(entityIndexPath), { recursive: true });
  fs.writeFileSync(entityIndexPath, JSON.stringify(entityIndex, null, 2), "utf8");

  console.log(`\nWrote '${wroteDocs}' document(s), skipped '${skippedDocs}' document(s) with contents that did not change`);
  console.log(`Wrote '${wrotePages}' page(s), skipped '${skippedPages}' page(s) with contents that did not change`);
  console.log(`Removed '${removedDocs}' stale document(s) and '${removedPages}' stale page(s)`);
}

/**
 * Deletes the mdx of entities that are no longer generated. An entity that gets renamed or
 * dropped upstream would otherwise leave its old page behind for good, and it would keep
 * building as a real route.
 *
 * Only .mdx is considered, so the readme and _category_.json that live in these folders by hand
 * are never at risk.
 */
function removeStaleMdx(folder: string, generated: Set<string>): number {
  if (!fs.existsSync(folder)) {
    return 0;
  }

  let removed = 0;

  for (const file of getFiles(folder)) {
    if (path.extname(file) !== ".mdx" || generated.has(file)) {
      continue;
    }

    fs.rmSync(file);
    removed++;
    console.log(`Removed '${file}', nothing generates it any more`);
  }

  return removed;
}

function getFiles(folder: string): string[] {
  return fs
    .readdirSync(folder, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(folder, entry.name));
}

function writeFileIfContentsChanged(filePath: string, contents: string): boolean {
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, "utf8") === contents) {
    return false;
  }

  fs.writeFileSync(filePath, contents, "utf8");
  return true;
}
