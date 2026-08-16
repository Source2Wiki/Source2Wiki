/**
 * The shape of the JSON in \fgd_dump and \fgd_dump_overrides.
 *
 * Reading is forgiving about missing keys, an override file only sets what it wants to change.
 * The few fields the wiki gives meaning to (entity type, annotation type) are checked against
 * what it can render, so a typo in a hand written override is an error rather than something
 * that quietly reaches a page.
 */

import fs from "node:fs";

import { admonitionKeywords } from "../../src/admonitions";
import { Game, getGameByFileSystemName } from "./games";
import * as wiki from "./wiki-paths";

export type EntityType = (typeof EntityTypes)[number];
export type InputOutputType = (typeof InputOutputTypes)[number];

export const EntityTypes = ["Default", "Point", "Mesh"] as const;

export const InputOutputTypes = ["Input", "Output"] as const;

// "Default" is our marker for an override that did not ask for a particular admonition, the
// rest is whatever the site is configured to render
const AnnotationTypes = ["Default", ...admonitionKeywords];

export interface Annotation {
  Message: string;
  Type: string;
  InternalName: string;
}

export interface Option {
  Name: string;
  Description: string;
  Key: string | null;
}

export interface Property {
  FriendlyName: string;
  InternalName: string;
  VariableType: string | null;
  Description: string;
  Options: Option[];
  Annotations: Annotation[];
}

export interface InputOutput {
  Name: string;
  Description: string;
  VariableType: string | null;
  Type: InputOutputType | null;
}

export interface EntityPage {
  Game: Game | null;
  EntityType: EntityType;
  Name: string;
  Description: string;
  IconPath: string;
  NonFGD: boolean;
  Legacy: boolean;
  PageAnnotation: Annotation | null;
  Properties: Property[];
  InputOutputs: InputOutput[];
}

export interface EntityDocument {
  Name: string;
  Pages: EntityPage[];
}

export function getPageRelativePath(page: EntityPage): string {
  return `${page.Name}-${page.Game!.fileSystemName}.mdx`;
}

/**
 * Site URL of a page's icon, or null when there is no icon file on disk. IconPath is a wiki
 * path once the dump has extracted it, and it is the only thing worth rendering, an
 * unresolved material reference from the FGD is of no use to the wiki.
 */
export function getIconUrl(page: EntityPage): string | null {
  return wiki.exists(page.IconPath) ? wiki.toUrl(page.IconPath) : null;
}

export function parseEntityDocumentFile(filePath: string): EntityDocument {
  const value = readJsonObject(filePath);

  return {
    Name: readString(value, "Name", filePath),
    Pages: readArray(value, "Pages", filePath).map((page) => toEntityPage(page, filePath)),
  };
}

export function parseEntityPageFile(filePath: string): EntityPage {
  const text = fs.readFileSync(filePath, "utf8");

  if (text.length === 0) {
    throw new Error(`JSON file has empty content! ${filePath}`);
  }

  return toEntityPage(JSON.parse(text), filePath);
}

function toEntityPage(value: unknown, filePath: string): EntityPage {
  const page = asObject(value, filePath);

  return {
    Game: getGameByFileSystemName(readOptionalString(page, "Game", filePath)),
    EntityType: readEnum(page, "EntityType", EntityTypes, filePath) ?? "Default",
    Name: readString(page, "Name", filePath),
    Description: readString(page, "Description", filePath),
    IconPath: readString(page, "IconPath", filePath),
    NonFGD: readBoolean(page, "NonFGD", filePath),
    Legacy: readBoolean(page, "Legacy", filePath),
    PageAnnotation: readOptionalObject(page, "PageAnnotation", filePath, toAnnotation),
    Properties: readArray(page, "Properties", filePath).map((p) => toProperty(p, filePath)),
    InputOutputs: readArray(page, "InputOutputs", filePath).map((io) => toInputOutput(io, filePath)),
  };
}

function toProperty(value: unknown, filePath: string): Property {
  const property = asObject(value, filePath);

  return {
    FriendlyName: readString(property, "FriendlyName", filePath),
    InternalName: readString(property, "InternalName", filePath),
    VariableType: readOptionalString(property, "VariableType", filePath),
    Description: readString(property, "Description", filePath),
    Options: readArray(property, "Options", filePath).map((o) => toOption(o, filePath)),
    Annotations: readArray(property, "Annotations", filePath).map((a) => toAnnotation(a, filePath)),
  };
}

function toOption(value: unknown, filePath: string): Option {
  const option = asObject(value, filePath);

  return {
    Name: readString(option, "Name", filePath),
    Description: readString(option, "Description", filePath),
    Key: readOptionalString(option, "Key", filePath),
  };
}

function toInputOutput(value: unknown, filePath: string): InputOutput {
  const inputOutput = asObject(value, filePath);

  return {
    Name: readString(inputOutput, "Name", filePath),
    Description: readString(inputOutput, "Description", filePath),
    VariableType: readOptionalString(inputOutput, "VariableType", filePath),
    Type: readEnum(inputOutput, "Type", InputOutputTypes, filePath),
  };
}

function toAnnotation(value: unknown, filePath: string): Annotation {
  const annotation = asObject(value, filePath);

  return {
    Message: readString(annotation, "Message", filePath),
    Type: readEnum(annotation, "Type", AnnotationTypes, filePath) ?? "Default",
    InternalName: readString(annotation, "InternalName", filePath),
  };
}

type JsonObject = Record<string, unknown>;

function readJsonObject(filePath: string): JsonObject {
  return asObject(JSON.parse(fs.readFileSync(filePath, "utf8")), filePath);
}

function asObject(value: unknown, filePath: string): JsonObject {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`Expected a JSON object in '${filePath}', got '${JSON.stringify(value)}'`);
  }

  return value as JsonObject;
}

function readString(value: JsonObject, key: string, filePath: string): string {
  return readOptionalString(value, key, filePath) ?? "";
}

function readOptionalString(value: JsonObject, key: string, filePath: string): string | null {
  const field = value[key];

  if (field === undefined || field === null) {
    return null;
  }

  if (typeof field !== "string") {
    throw new Error(`Expected '${key}' to be a string in '${filePath}'`);
  }

  return field;
}

function readBoolean(value: JsonObject, key: string, filePath: string): boolean {
  const field = value[key];

  if (field === undefined || field === null) {
    return false;
  }

  if (typeof field !== "boolean") {
    throw new Error(`Expected '${key}' to be a boolean in '${filePath}'`);
  }

  return field;
}

function readArray(value: JsonObject, key: string, filePath: string): unknown[] {
  const field = value[key];

  if (field === undefined || field === null) {
    return [];
  }

  if (!Array.isArray(field)) {
    throw new Error(`Expected '${key}' to be an array in '${filePath}'`);
  }

  return field;
}

function readOptionalObject<T>(
  value: JsonObject,
  key: string,
  filePath: string,
  parse: (value: unknown, filePath: string) => T,
): T | null {
  const field = value[key];

  return field === undefined || field === null ? null : parse(field, filePath);
}

function readEnum<T extends string>(
  value: JsonObject,
  key: string,
  names: readonly T[],
  filePath: string,
): T | null {
  const name = readOptionalString(value, key, filePath);

  if (name === null) {
    return null;
  }

  const match = names.find((candidate) => candidate.toLowerCase() === name.toLowerCase());

  if (match === undefined) {
    throw new Error(`'${name}' is not a valid ${key} in '${filePath}', expected one of: ${names.join(", ")}`);
  }

  return match;
}
