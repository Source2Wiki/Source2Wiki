import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { EntityDocument, EntityPage, parseEntityPageFile } from "../entity-pages/model";
import { handleOverrides } from "../entity-pages/overrides";

/** Writes override files into a throwaway folder and returns their paths, in the given order. */
function overrideFiles(files: Record<string, unknown>): string[] {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), "overrides-"));

  return Object.entries(files).map(([name, contents]) => {
    const file = path.join(folder, name);
    fs.writeFileSync(file, JSON.stringify(contents));
    return file;
  });
}

function dumpedPage(overrides: Partial<EntityPage> = {}): EntityPage {
  return {
    Game: "hla",
    EntityType: "Point",
    Name: "test_entity",
    Description: "The dumped description.",
    IconPath: "static/img/dumped.png",
    NonFGD: false,
    Legacy: false,
    PageAnnotation: null,
    Properties: [],
    InputOutputs: [],
    ...overrides,
  };
}

function documents(...pages: EntityPage[]): Map<string, EntityDocument> {
  return new Map([["test_entity", { Name: "test_entity", Pages: pages }]]);
}

function pageAfter(override: unknown, page = dumpedPage()): EntityPage {
  const docs = documents(page);
  handleOverrides(overrideFiles({ "test_entity.json": override }), docs);
  return docs.get("test_entity")!.Pages[0];
}

test("a key the override does not mention is left alone", () => {
  assert.equal(pageAfter({ Legacy: true }).Description, "The dumped description.");
});

test("a key the override does mention wins", () => {
  assert.equal(pageAfter({ Description: "Better words." }).Description, "Better words.");
});

test("an empty string clears a field, it does not mean 'unset'", () => {
  // the C# original could never remove a bad FGD description, "" meant leave it alone
  assert.equal(pageAfter({ Description: "" }).Description, "");
  assert.equal(pageAfter({ IconPath: "" }).IconPath, "");
});

test("booleans can be turned back off", () => {
  const page = dumpedPage({ Legacy: true, NonFGD: true });

  assert.equal(pageAfter({ Legacy: false }, page).Legacy, false);
});

test("a property the page does not have is added, untyped ones become Void", () => {
  const page = pageAfter({
    Properties: [{ InternalName: "added", FriendlyName: "Added" }],
  });

  assert.equal(page.Properties.length, 1);
  assert.equal(page.Properties[0].VariableType, "Void");
});

test("a property the page already has is merged into, not duplicated", () => {
  const page = pageAfter(
    { Properties: [{ InternalName: "existing", Description: "Explained properly." }] },
    dumpedPage({
      Properties: [
        {
          FriendlyName: "Existing",
          InternalName: "existing",
          VariableType: "Float",
          Description: "Terse FGD text.",
          Options: [],
          Annotations: [],
        },
      ],
    }),
  );

  assert.equal(page.Properties.length, 1);
  assert.equal(page.Properties[0].Description, "Explained properly.");
  // the fields the override said nothing about survive
  assert.equal(page.Properties[0].FriendlyName, "Existing");
  assert.equal(page.Properties[0].VariableType, "Float");
});

test("an override for an entity with no dump becomes a non-FGD page per game", () => {
  const docs = new Map<string, EntityDocument>();
  handleOverrides(overrideFiles({ "invented_entity.json": { Description: "Not in any FGD." } }), docs);

  const pages = docs.get("invented_entity")!.Pages;
  assert.deepEqual(
    pages.map((page) => page.Game),
    ["cs2", "hla", "dota2", "steamvr"],
  );
  assert.ok(pages.every((page) => page.NonFGD === true && page.Name === "invented_entity"));
});

test("a game specific override only touches that game", () => {
  const docs = documents(dumpedPage({ Game: "hla" }), dumpedPage({ Game: "cs2" }));
  handleOverrides(overrideFiles({ "test_entity-cs2.json": { Description: "cs2 only." } }), docs);

  const [hla, cs2] = docs.get("test_entity")!.Pages;
  assert.equal(hla.Description, "The dumped description.");
  assert.equal(cs2.Description, "cs2 only.");
});

test("an unknown game in the filename is an error that lists the real ones", () => {
  assert.throws(
    () => handleOverrides(overrideFiles({ "test_entity-cs2go.json": {} }), documents(dumpedPage())),
    /Invalid override entity game 'cs2go'[\s\S]*cs2[\s\S]*steamvr/,
  );
});

test("a bad enum names the file it came from", () => {
  const [file] = overrideFiles({ "test_entity.json": { PageAnnotation: { Type: "warnin" } } });

  assert.throws(() => parseEntityPageFile(file), (error: Error) => {
    assert.match(error.message, /test_entity\.json: 'warnin' is not a valid Type/);
    assert.match(error.message, /warning/); // it suggests what was allowed
    return true;
  });
});

test("malformed json names the file too", () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), "overrides-"));
  const file = path.join(folder, "broken.json");
  fs.writeFileSync(file, "{ nope");

  assert.throws(() => parseEntityPageFile(file), /broken\.json: /);
});
