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

export const EntityTypes = ["Point", "Mesh"] as const;

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
  EntityType: EntityType | null;
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
  return parseFile(filePath, (doc) => ({
    Name: doc.Name ?? "",
    Pages: (doc.Pages ?? []).map(toEntityPage),
  }));
}

export function parseEntityPageFile(filePath: string): EntityPage {
  return parseFile(filePath, toEntityPage);
}

/** Anything read out of a dump or an override file, before we have looked at it. */
type RawJson = Record<string, any>;

/** Parses a file, naming it in whatever goes wrong while reading it. */
function parseFile<T>(filePath: string, parse: (value: RawJson) => T): T {
  try {
    return parse(JSON.parse(fs.readFileSync(filePath, "utf8")));
  } catch (error) {
    throw new Error(`${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function toEntityPage(page: RawJson): EntityPage {
  return {
    Game: getGameByFileSystemName(page.Game),
    EntityType: readEnum(page.EntityType, EntityTypes, "EntityType"),
    Name: page.Name ?? "",
    Description: page.Description ?? "",
    IconPath: page.IconPath ?? "",
    NonFGD: page.NonFGD ?? false,
    Legacy: page.Legacy ?? false,
    PageAnnotation: page.PageAnnotation ? toAnnotation(page.PageAnnotation) : null,
    Properties: (page.Properties ?? []).map(toProperty),
    InputOutputs: (page.InputOutputs ?? []).map(toInputOutput),
  };
}

function toProperty(property: RawJson): Property {
  return {
    FriendlyName: property.FriendlyName ?? "",
    InternalName: property.InternalName ?? "",
    VariableType: property.VariableType ?? null,
    Description: property.Description ?? "",
    Options: (property.Options ?? []).map(toOption),
    Annotations: (property.Annotations ?? []).map(toAnnotation),
  };
}

function toOption(option: RawJson): Option {
  return {
    Name: option.Name ?? "",
    Description: option.Description ?? "",
    Key: option.Key ?? null,
  };
}

function toInputOutput(inputOutput: RawJson): InputOutput {
  return {
    Name: inputOutput.Name ?? "",
    Description: inputOutput.Description ?? "",
    VariableType: inputOutput.VariableType ?? null,
    Type: readEnum(inputOutput.Type, InputOutputTypes, "Type"),
  };
}

function toAnnotation(annotation: RawJson): Annotation {
  return {
    Message: annotation.Message ?? "",
    Type: readEnum(annotation.Type, AnnotationTypes, "Type") ?? "Default",
    InternalName: annotation.InternalName ?? "",
  };
}

/** Matches how the dumps spell their enums, case insensitively, and rejects anything else. */
function readEnum<T extends string>(value: unknown, names: readonly T[], field: string): T | null {
  if (value === undefined || value === null) {
    return null;
  }

  const match = names.find((name) => name.toLowerCase() === String(value).toLowerCase());

  if (match === undefined) {
    throw new Error(`'${value}' is not a valid ${field}, expected one of: ${names.join(", ")}`);
  }

  return match;
}
