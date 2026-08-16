import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { generateMdxFromJsonDump } from "../entity-pages/generate";
import * as wiki from "../entity-pages/wiki-paths";

/** A throwaway wiki holding one dumped entity, generated into and thrown away by the caller. */
function miniWiki(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "wiki-"));

  fs.mkdirSync(path.join(root, wiki.DumpFolder), { recursive: true });
  fs.mkdirSync(path.join(root, wiki.OverridesFolder), { recursive: true });
  fs.writeFileSync(
    path.join(root, wiki.DumpFolder, "test_entity.json"),
    JSON.stringify({
      Name: "test_entity",
      Pages: [{ Game: "hla", EntityType: "Point", Name: "test_entity", Description: "A test entity." }],
    }),
  );

  wiki.setWikiRoot(root);
  return root;
}

function inWiki(root: string, ...segments: string[]): string {
  return path.join(root, ...segments);
}

test("generation writes a document and a page per game", (t) => {
  const root = miniWiki();
  t.after(() => {
    wiki.setWikiRoot("");
    fs.rmSync(root, { recursive: true, force: true });
  });

  generateMdxFromJsonDump();

  assert.ok(fs.existsSync(inWiki(root, wiki.DocsFolder, "test_entity.mdx")));
  assert.ok(fs.existsSync(inWiki(root, wiki.PagesFolder, "test_entity-hla.mdx")));
  assert.equal(
    JSON.parse(fs.readFileSync(inWiki(root, "static", wiki.DumpFolder, "entityIndex.json"), "utf8")).length,
    1,
  );
});

test("mdx of an entity that is no longer dumped is deleted", (t) => {
  const root = miniWiki();
  t.after(() => {
    wiki.setWikiRoot("");
    fs.rmSync(root, { recursive: true, force: true });
  });

  // a second entity, which a later game update then drops
  fs.writeFileSync(
    inWiki(root, wiki.DumpFolder, "doomed_entity.json"),
    JSON.stringify({
      Name: "doomed_entity",
      Pages: [{ Game: "hla", EntityType: "Point", Name: "doomed_entity" }],
    }),
  );

  generateMdxFromJsonDump();
  assert.ok(fs.existsSync(inWiki(root, wiki.DocsFolder, "doomed_entity.mdx")));

  fs.rmSync(inWiki(root, wiki.DumpFolder, "doomed_entity.json"));
  generateMdxFromJsonDump();

  assert.ok(!fs.existsSync(inWiki(root, wiki.DocsFolder, "doomed_entity.mdx")));
  assert.ok(!fs.existsSync(inWiki(root, wiki.PagesFolder, "doomed_entity-hla.mdx")));
  // the entity that is still dumped is untouched
  assert.ok(fs.existsSync(inWiki(root, wiki.DocsFolder, "test_entity.mdx")));
});

test("the hand written files living in those folders are never touched", (t) => {
  const root = miniWiki();
  t.after(() => {
    wiki.setWikiRoot("");
    fs.rmSync(root, { recursive: true, force: true });
  });

  generateMdxFromJsonDump();

  const category = inWiki(root, wiki.DocsFolder, "_category_.json");
  const readme = inWiki(root, wiki.PagesFolder, "README.txt");
  fs.writeFileSync(category, '{"label": "Entities"}');
  fs.writeFileSync(readme, "do not delete me");

  generateMdxFromJsonDump();

  assert.ok(fs.existsSync(category));
  assert.equal(fs.readFileSync(readme, "utf8"), "do not delete me");
});
