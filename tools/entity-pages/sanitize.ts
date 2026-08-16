/**
 * FGD descriptions are written for hammer's tooltips, not for MDX. They carry stray angle
 * brackets, half finished tags and braces that MDX would try to evaluate as JSX, so they get
 * escaped down to the few tags that are worth keeping.
 */

const AllowedTags = ["b", "br", "strong"];

// match opening tags that are NOT in the allowed list
const InvalidTag = new RegExp(`<(?!/?(?:${AllowedTags.join("|")})\\b)[^>]*>`, "gi");

export function sanitizeInput(input: string): string {
  // make this newline so stuff displays nicely
  input = input.replaceAll("<br>", "\n");

  // no clue what this does in hammer, seems to be nothing
  // a lot of these are just broken so im removing them outright to avoid confusion
  input = input.replaceAll("<original name>", "");
  input = input.replaceAll("<Award Text>", "");
  input = input.replaceAll("<picker>", "");
  input = input.replaceAll("<None>", "None");

  // escape any funky tags
  input = input.replace(InvalidTag, (tag) => htmlEncode(tag));
  // escape unclosed tags at the end
  input = input.replace(/<([^>]*)$/g, "&lt;$1");
  // escape unclosed tags followed by another opening tag
  input = input.replace(/<([^>]*)(?=<)/g, "&lt;$1");
  // escape unmatched closing brackets at start
  input = input.replace(/^([^<]*?)>/g, "$1&gt;");
  // escape unmatched closing brackets after other closing brackets
  input = input.replace(/(?<=>)([^<]*?)>/g, "$1&gt;");

  return input.replaceAll("{", "\\{").replaceAll("}", "\\}");
}

export function sanitizeInputTable(input: string): string {
  return sanitizeInput(input).replaceAll("|", "\\|");
}

const HtmlEscapes: Record<string, string> = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
};

function htmlEncode(value: string): string {
  return value.replace(/[<>"'&]/g, (character) => HtmlEscapes[character]);
}
