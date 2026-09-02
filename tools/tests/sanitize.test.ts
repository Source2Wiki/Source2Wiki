import assert from "node:assert/strict";
import { test } from "node:test";

import { sanitizeInput, sanitizeInputTable, sanitizeMetaDescription } from "../entity-pages/sanitize";

test("keeps the tags that render, escapes the ones that do not", () => {
  assert.equal(sanitizeInput("<b>bold</b> and <strong>strong</strong>"), "<b>bold</b> and <strong>strong</strong>");
  assert.equal(sanitizeInput("a <div>tag</div> b"), "a &lt;div&gt;tag&lt;/div&gt; b");
});

test("turns <br> into a newline so descriptions wrap", () => {
  assert.equal(sanitizeInput("one<br>two"), "one\ntwo");
});

test("drops the hammer placeholders", () => {
  assert.equal(sanitizeInput("name: <original name>"), "name: ");
  assert.equal(sanitizeInput("<None>"), "None");
});

test("escapes braces, MDX would evaluate them as JSX", () => {
  assert.equal(sanitizeInput("{ not jsx }"), "\\{ not jsx \\}");
});

test("escapes stray angle brackets", () => {
  // an unclosed tag at the end of the string
  assert.equal(sanitizeInput("value <unclosed"), "value &lt;unclosed");
  // a closing bracket with nothing opening it
  assert.equal(sanitizeInput("10 > 5"), "10 &gt; 5");
});

test("leaves non-ascii alone rather than encoding it numerically", () => {
  // WebUtility.HtmlEncode used to turn these into &#233; and &#128512;
  assert.equal(sanitizeInput("<i>café 😀</i>"), "&lt;i&gt;café 😀&lt;/i&gt;");
  assert.equal(sanitizeInput("café 😀"), "café 😀");
});

test("the meta variant strips markup down to plain text for social embeds", () => {
  assert.equal(sanitizeMetaDescription("<b>Sound Types</b><br>- Combat"), "Sound Types\n- Combat");
  assert.equal(sanitizeMetaDescription("one<br/>two<br />three"), "one\ntwo\nthree");
  assert.equal(sanitizeMetaDescription("<strong>bold</strong> text"), "bold text");
  assert.equal(sanitizeMetaDescription("name: <original name>"), "name:");
  assert.equal(sanitizeMetaDescription("<None>"), "None");
});

test("the meta variant keeps line breaks but caps blank lines", () => {
  // <br><br> is how FGDs write a paragraph break, keep it as one blank line
  assert.equal(sanitizeMetaDescription("intro<br><br><b>List</b><br>- item"), "intro\n\nList\n- item");
  assert.equal(sanitizeMetaDescription("a<br><br><br><br>b"), "a\n\nb");
  assert.equal(sanitizeMetaDescription("a  <br>  b"), "a\nb");
});

test("the table variant also escapes pipes so cells do not split", () => {
  assert.equal(sanitizeInputTable("a | b"), "a \\| b");
  assert.equal(sanitizeInput("a | b"), "a | b");
});
