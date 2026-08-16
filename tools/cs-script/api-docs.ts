/**
 * Turns the `point_script.d.ts` that ships with CS2 into the markdown tables on the cs_script
 * API documentation page.
 *
 * The file is parsed with the TypeScript compiler rather than matched line by line, so a
 * declaration is found because it is a declaration, not because it happened to end in a
 * semicolon.
 */

import ts from "typescript";

interface Member {
  name: string;
  signature: string;
  description: string;
}

interface Container {
  name: string;
  description: string;
  functions: Member[];
  events: Member[];
}

interface TypeAlias {
  name: string;
  definition: string;
  description: string;
}

interface Interface {
  name: string;
  description: string;
  bodyLines: string[];
}

interface EnumMember {
  name: string;
  value: string | null;
  description: string;
}

interface Enum {
  name: string;
  description: string;
  members: EnumMember[];
}

interface Api {
  containers: Container[];
  typeAliases: TypeAlias[];
  interfaces: Interface[];
  enums: Enum[];
}

/** Methods that take a callback register a listener rather than compute a value. */
function isEvent(name: string, signature: string): boolean {
  return signature.includes("callback:") || name.startsWith("On");
}

export function parseApi(fileName: string, source: string): Api {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);

  const api: Api = { containers: [], typeAliases: [], interfaces: [], enums: [] };

  const visit = (node: ts.Node): void => {
    // everything worth documenting lives inside `declare module "cs_script/point_script"`
    if (ts.isModuleDeclaration(node) || ts.isModuleBlock(node) || ts.isSourceFile(node)) {
      node.forEachChild(visit);
      return;
    }

    if (ts.isClassDeclaration(node) && node.name) {
      api.containers.push(toContainer(node.name.text, node.members, node));
      return;
    }

    if (ts.isInterfaceDeclaration(node)) {
      api.interfaces.push({
        name: node.name.text,
        description: describe(node),
        // the raw body, so the doc comments on each field survive into the code block
        bodyLines: bodyOf(node),
      });
      return;
    }

    if (ts.isEnumDeclaration(node)) {
      api.enums.push({
        name: node.name.text,
        description: describe(node),
        members: node.members.map((member) => ({
          name: member.name.getText(),
          value: member.initializer?.getText() ?? null,
          description: describe(member) || trailingComment(file.text, member),
        })),
      });
      return;
    }

    if (ts.isTypeAliasDeclaration(node)) {
      api.typeAliases.push({
        name: node.name.text,
        definition: node.type.getText(),
        description: describe(node),
      });
    }
  };

  visit(file);

  return api;
}

function toContainer(name: string, members: ts.NodeArray<ts.ClassElement>, node: ts.Node): Container {
  const container: Container = { name, description: describe(node), functions: [], events: [] };

  for (const member of members) {
    if (!ts.isMethodDeclaration(member) && !ts.isMethodSignature(member)) {
      continue;
    }

    const memberName = member.name.getText();
    // the node ends at its semicolon, so a trailing // comment never reaches the signature
    const signature = member.getText().trim().replace(/;$/, "");
    const documented: Member = { name: memberName, signature, description: describe(member) };

    (isEvent(memberName, signature) ? container.events : container.functions).push(documented);
  }

  return container;
}

/**
 * The `// like this` note that follows a declaration on its own line. Enum members use these to
 * explain a name that says nothing on its own, so they are worth keeping.
 */
function trailingComment(source: string, node: ts.Node): string {
  const lineEnd = source.indexOf("\n", node.end);
  const rest = source.slice(node.end, lineEnd === -1 ? source.length : lineEnd);
  // no end anchor: the slice is already one line, and a \r would stop . from reaching it
  const comment = /\/\/(.*)/.exec(rest);

  return comment === null ? "" : comment[1].trim();
}

/** The lines between an interface's braces, exactly as they were written. */
function bodyOf(node: ts.InterfaceDeclaration): string[] {
  const text = node.getText();
  // trimmed, the code block gets one level of indentation of its own
  const lines = text.slice(text.indexOf("{") + 1, text.lastIndexOf("}")).split("\n").map((line) => line.trim());

  if (lines.length > 0 && lines[0].trim().length === 0) {
    lines.shift();
  }
  if (lines.length > 0 && lines[lines.length - 1].trim().length === 0) {
    lines.pop();
  }

  return lines;
}

/**
 * The description a declaration carries. A one line comment is taken as written, since that is
 * often the only thing a member documents, tag and all. A multi line one becomes a paragraph per
 * line, without the @param/@returns/@example tags, which would only repeat the signature column.
 */
function describe(node: ts.Node): string {
  const comments = (node as { jsDoc?: ts.Node[] }).jsDoc;

  if (comments === undefined || comments.length === 0) {
    return "";
  }

  const raw = comments[comments.length - 1].getText().replace(/^\/\*\*/, "").replace(/\*\/$/, "");

  if (!raw.includes("\n")) {
    return raw.trim();
  }

  return raw
    .split("\n")
    .map((line) => line.trim().replace(/^\*+/, "").trim())
    .filter((line) => line.length > 0 && !/^@(param|returns|example)/.test(line))
    .join("\n\n")
    .trim();
}

export function renderApi(api: Api): string {
  const known = new Set([
    ...api.typeAliases.map((alias) => alias.name),
    ...api.interfaces.map((entry) => entry.name),
    ...api.enums.map((entry) => entry.name),
    ...api.containers.map((container) => container.name),
  ]);

  // longest first, so `CSPlayerPawn` is not half linked by `Entity`
  const linkable = [...known].sort((a, b) => b.length - a.length);

  const link = (text: string): string => {
    for (const name of linkable) {
      const pattern = new RegExp(`(?<!\\[)(?<!\\(#)\\b${escapeRegex(name)}\\b(?!\\])`, "g");
      text = text.replace(pattern, `[${name}](#${name.toLowerCase()})`);
    }

    return text;
  };

  const row = (member: Member): string =>
    `|${escapeCell(member.name)}|${link(escapeCell(member.signature))}|${link(escapeCell(member.description))}|`;

  const out: string[] = [];

  for (const container of api.containers) {
    if (container.functions.length === 0 && container.events.length === 0) {
      continue;
    }

    out.push(`### ${container.name}`);
    if (container.description.length > 0) {
      out.push(container.description);
    }
    out.push("");

    for (const [heading, members] of [
      ["Functions", container.functions],
      ["Events", container.events],
    ] as const) {
      if (members.length === 0) {
        continue;
      }

      out.push(`#### ${heading}`, "", "|Name|Signature|Description|", "|---|---|---|");
      out.push(...members.map(row));
      out.push("");
    }
  }

  if (api.typeAliases.length > 0) {
    out.push("## Types", "");

    for (const alias of api.typeAliases) {
      out.push(`### ${alias.name}`);
      if (alias.description.length > 0) {
        out.push(alias.description);
      }
      out.push("", "```ts", `type ${alias.name} = ${alias.definition};`, "```", "");
    }
  }

  if (api.interfaces.length > 0) {
    out.push("## Interfaces", "");

    for (const entry of api.interfaces) {
      out.push(`### ${entry.name}`);
      if (entry.description.length > 0) {
        out.push(entry.description, "");
      }
      out.push("```ts", `interface ${entry.name} {`);
      out.push(...entry.bodyLines.map((line) => `    ${line}`));
      out.push("}", "```", "");
    }
  }

  if (api.enums.length > 0) {
    out.push("## Enums", "");

    for (const entry of api.enums) {
      out.push(`### ${entry.name}`);
      if (entry.description.length > 0) {
        out.push(entry.description, "");
      }
      out.push(
        ...entry.members.map((member) => {
          const label = escapeCell(member.value !== null ? `${member.name} = ${member.value}` : member.name);

          return member.description.length > 0 ? `- ${label} — ${escapeCell(member.description)}` : `- ${label}`;
        }),
      );
      out.push("");
    }
  }

  return `${out.join("\n")}\n`;
}

/**
 * Escapes a value so it survives a markdown table cell and MDX. Braces inside a backtick span
 * are left alone, that is code the reader is meant to see verbatim.
 */
function escapeCell(input: string): string {
  let escaped = "";
  let inCode = false;

  for (const character of input.replaceAll("&", "\\&").replaceAll("<", "\\<").replaceAll(">", "\\>").replaceAll("|", "\\|")) {
    if (character === "`") {
      inCode = !inCode;
      escaped += character;
    } else if (!inCode && (character === "{" || character === "}")) {
      escaped += `\\${character}`;
    } else {
      escaped += character;
    }
  }

  // last, so the tag itself is never caught by the < and > escaping above
  return escaped.replaceAll("\r\n", "<br />").replaceAll("\r", "<br />").replaceAll("\n", "<br />");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
