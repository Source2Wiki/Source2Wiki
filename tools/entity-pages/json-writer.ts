/**
 * Writes JSON the way System.Text.Json does with WriteIndented, because entityIndex.json is
 * checked in: JSON.stringify would rewrite the whole file the first time this tool runs after
 * WikiPageTools, purely over escaping and line endings.
 *
 * The differences worth knowing about are that the indented writer separates lines with
 * Environment.NewLine, and that the default JavaScriptEncoder escapes every non-ASCII
 * character plus the ones that are dangerous to drop into HTML.
 */

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const Newline = "\r\n";
const Indent = "  ";

// escaped on top of the characters JSON itself requires: the HTML sensitive set that
// JavaScriptEncoder.Default forbids, and the grave accent
const ForcedEscapes = new Set(['"', "&", "'", "+", "<", ">", "`"]);

export function serializeIndented(value: JsonValue): string {
  return write(value, "");
}

function write(value: JsonValue, indent: string): string {
  if (value === null) {
    return "null";
  }

  switch (typeof value) {
    case "string":
      return `"${escapeString(value)}"`;
    case "number":
      return String(value);
    case "boolean":
      return value ? "true" : "false";
  }

  const inner = indent + Indent;

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }

    const items = value.map((item) => inner + write(item, inner));

    return `[${Newline}${items.join(`,${Newline}`)}${Newline}${indent}]`;
  }

  const entries = Object.entries(value);

  if (entries.length === 0) {
    return "{}";
  }

  const members = entries.map(([key, member]) => `${inner}"${escapeString(key)}": ${write(member, inner)}`);

  return `{${Newline}${members.join(`,${Newline}`)}${Newline}${indent}}`;
}

function escapeString(value: string): string {
  let escaped = "";

  for (const character of value) {
    switch (character) {
      case "\\":
        escaped += "\\\\";
        continue;
      case "\b":
        escaped += "\\b";
        continue;
      case "\t":
        escaped += "\\t";
        continue;
      case "\n":
        escaped += "\\n";
        continue;
      case "\f":
        escaped += "\\f";
        continue;
      case "\r":
        escaped += "\\r";
        continue;
    }

    const codePoint = character.codePointAt(0)!;

    // anything outside printable ASCII goes out as \uXXXX, astral characters as a surrogate pair
    escaped +=
      codePoint < 0x20 || codePoint >= 0x7f || ForcedEscapes.has(character)
        ? escapeCodePoint(character)
        : character;
  }

  return escaped;
}

function escapeCodePoint(character: string): string {
  let escaped = "";

  for (let unit = 0; unit < character.length; unit++) {
    escaped += `\\u${character.charCodeAt(unit).toString(16).toUpperCase().padStart(4, "0")}`;
  }

  return escaped;
}
