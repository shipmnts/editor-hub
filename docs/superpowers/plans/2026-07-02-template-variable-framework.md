# Template Variable Framework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a variable framework to `editor-hub` so a template authored in the Quill editor can embed variables (via `{{`) and be rendered to final HTML by passing a plain JSON object of values.

**Architecture:** Reuse the existing `RichTextEditorWrapper` (Quill 2.0 + quill-mention). Variables are inserted as quill-mention chips (`<span class="mention" data-id="shipper">`), triggered by typing `{{`. A new pure function `renderTemplate(html, variables)` walks the stored template HTML, replaces every mention chip with the matching value from the JSON (missing → empty string), and returns final HTML. A small browser demo wires an editor to a live-rendered preview.

**Tech Stack:** React 18, Quill 2.0-dev, quill-mention, Webpack + webpack-dev-server, Jest (jsdom) for the pure render function.

## Global Constraints

- Package: `editor-hub`. React is a **peer dependency** (`^16 || ^17 || ^18`) — do NOT add react/react-dom to `dependencies`.
- Do NOT modify the library build entry (`index.js` → `dist/index.js`) behavior beyond adding new exports.
- Token trigger syntax is `{{` and the chip stores the variable key in `data-id`.
- Missing variable at render time → **empty string** (never leave `{{key}}` visible).
- New code lives under `src/template/`.
- The render function must be pure and framework-free (no React import) so it can run in Node/jsdom and, later, be ported server-side.
- Do NOT commit or push unless the user explicitly asks — the user is reviewing the diff manually.

---

### Task 1: Test tooling (Jest + Babel for jsdom tests)

**Files:**
- Create: `babel.config.js`
- Modify: `package.json` (add `devDependencies` + `test` script)

**Interfaces:**
- Consumes: nothing.
- Produces: a working `yarn test` command running Jest in a jsdom environment with ES-module/JSX transpilation. Later tasks rely on `describe`/`it`/`expect` globals and `document` being available in tests.

- [ ] **Step 1: Install dev dependencies**

Run:
```bash
cd /Users/chintukumarbhanderi/Shipments/editor-hub
yarn add -D jest@^29 jest-environment-jsdom@^29 babel-jest@^29 @babel/core@^7
```
Expected: installs succeed; `node_modules/.bin/jest` exists.

- [ ] **Step 2: Create Babel config for Jest**

Create `babel.config.js`:
```js
module.exports = {
  presets: ["@babel/preset-env", "@babel/preset-react"],
};
```

- [ ] **Step 3: Add Jest config + test script to package.json**

In `package.json`, add a `"jest"` block and a `"test"` script (keep existing `build`/`start`/`watch`):
```json
"scripts": {
  "build": "webpack --mode production",
  "start": "webpack-dev-server --open --mode development",
  "watch": "webpack --watch --mode development",
  "test": "jest"
},
"jest": {
  "testEnvironment": "jsdom",
  "testMatch": ["**/src/template/**/*.test.js"]
}
```

- [ ] **Step 4: Verify Jest runs (no tests yet)**

Run: `yarn test --passWithNoTests`
Expected: exit 0, "No tests found, exiting with code 0" (via `--passWithNoTests`).

- [ ] **Step 5: Commit** (only if the user has approved committing)

```bash
git add babel.config.js package.json yarn.lock
git commit -m "chore: add jest + babel test tooling"
```

---

### Task 2: `renderTemplate` — replace mention chips with values

**Files:**
- Create: `src/template/renderTemplate.js`
- Test: `src/template/renderTemplate.test.js`

**Interfaces:**
- Consumes: DOM `document` (jsdom in tests, browser at runtime).
- Produces: `export default function renderTemplate(templateHtml: string, variables?: Record<string, any>): string`
  — returns HTML where every `<span class="mention" data-id="KEY">…</span>` is replaced by `String(variables[KEY])`, or `""` when the key is missing/null/undefined. Non-mention HTML is preserved. Value text is inserted as a DOM text node so it is HTML-escaped.

- [ ] **Step 1: Write the failing tests**

Create `src/template/renderTemplate.test.js`:
```js
import renderTemplate from "./renderTemplate";

const chip = (id, label = id) =>
  `<span class="mention" data-id="${id}" data-value="${label}">` +
  `<span class="ql-mention-denotation-char">{{</span>${label}</span>`;

describe("renderTemplate", () => {
  it("replaces a mention chip with its value", () => {
    const html = `<p>Shipper: ${chip("shipper", "Shipper")}</p>`;
    const out = renderTemplate(html, { shipper: "Commit Pvt Lmt." });
    expect(out).toContain("Shipper: Commit Pvt Lmt.");
    expect(out).not.toContain("mention");
  });

  it("replaces multiple different variables", () => {
    const html = `<p>${chip("shipper")} / ${chip("consignee")}</p>`;
    const out = renderTemplate(html, {
      shipper: "Commit Pvt Lmt.",
      consignee: "North West Lmt.",
    });
    expect(out).toContain("Commit Pvt Lmt. / North West Lmt.");
  });

  it("renders empty string for a missing variable", () => {
    const html = `<p>Shipper: ${chip("shipper")}</p>`;
    const out = renderTemplate(html, {});
    expect(out).toBe("<p>Shipper: </p>");
  });

  it("renders empty string for null/undefined values", () => {
    const html = `<p>${chip("a")}${chip("b")}</p>`;
    const out = renderTemplate(html, { a: null, b: undefined });
    expect(out).toBe("<p></p>");
  });

  it("HTML-escapes the injected value", () => {
    const html = `<p>${chip("x")}</p>`;
    const out = renderTemplate(html, { x: "<b>hi</b> & bye" });
    expect(out).toBe("<p>&lt;b&gt;hi&lt;/b&gt; &amp; bye</p>");
  });

  it("leaves non-mention HTML untouched", () => {
    const html = `<p><strong>Bill of Lading</strong></p>`;
    expect(renderTemplate(html, {})).toBe(html);
  });

  it("handles empty/undefined template", () => {
    expect(renderTemplate("", {})).toBe("");
    expect(renderTemplate(undefined, {})).toBe("");
  });

  it("coerces non-string values to string", () => {
    const html = `<p>${chip("qty")}</p>`;
    expect(renderTemplate(html, { qty: 42 })).toBe("<p>42</p>");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn test src/template/renderTemplate.test.js`
Expected: FAIL — "Cannot find module './renderTemplate'".

- [ ] **Step 3: Write minimal implementation**

Create `src/template/renderTemplate.js`:
```js
/**
 * Render a template HTML string by substituting quill-mention chips with values.
 *
 * A variable chip is a `<span class="mention" data-id="KEY">` produced by
 * quill-mention. Each chip is replaced by `variables[KEY]` (coerced to string),
 * or an empty string when the key is absent or its value is null/undefined.
 *
 * @param {string} templateHtml - stored Quill HTML containing mention chips
 * @param {Object} [variables]  - flat map of variable key -> value
 * @returns {string} final HTML with chips resolved
 */
export default function renderTemplate(templateHtml, variables = {}) {
  if (!templateHtml) return "";

  const container = document.createElement("div");
  container.innerHTML = templateHtml;

  const chips = container.querySelectorAll("span.mention[data-id]");
  chips.forEach((chip) => {
    const key = chip.dataset.id;
    const value = variables ? variables[key] : undefined;
    const text = value === null || value === undefined ? "" : String(value);
    chip.replaceWith(document.createTextNode(text));
  });

  return container.innerHTML;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test src/template/renderTemplate.test.js`
Expected: PASS — 8 passing.

- [ ] **Step 5: Commit** (only if the user has approved committing)

```bash
git add src/template/renderTemplate.js src/template/renderTemplate.test.js
git commit -m "feat: add renderTemplate to resolve variable chips to values"
```

---

### Task 3: Variable source helpers for the editor

**Files:**
- Create: `src/template/variableSource.js`
- Test: `src/template/variableSource.test.js`

**Interfaces:**
- Consumes: nothing (pure functions).
- Produces:
  - `export function toVariableList(variables)` — accepts either a flat map `{shipper:'x'}` OR an array `[{id,label}]` and returns `Array<{id: string, value: string}>` where `value` is the display label (label if given, else the key). This is the item shape quill-mention needs (`id` + `value`).
  - `export function createMentionSource(variableList)` — returns a quill-mention `source(searchTerm, renderList)` function that filters `variableList` by case-insensitive substring match on `value` and calls `renderList(matches, searchTerm)`.

- [ ] **Step 1: Write the failing tests**

Create `src/template/variableSource.test.js`:
```js
import { toVariableList, createMentionSource } from "./variableSource";

describe("toVariableList", () => {
  it("maps a flat object using keys as id and value", () => {
    expect(toVariableList({ shipper: "x", consignee: "y" })).toEqual([
      { id: "shipper", value: "shipper" },
      { id: "consignee", value: "consignee" },
    ]);
  });

  it("maps an array of {id,label} using label as value", () => {
    expect(
      toVariableList([{ id: "shipper", label: "Shipper" }])
    ).toEqual([{ id: "shipper", value: "Shipper" }]);
  });

  it("falls back to id when label absent in array form", () => {
    expect(toVariableList([{ id: "shipper" }])).toEqual([
      { id: "shipper", value: "shipper" },
    ]);
  });

  it("returns [] for empty/undefined input", () => {
    expect(toVariableList()).toEqual([]);
    expect(toVariableList({})).toEqual([]);
  });
});

describe("createMentionSource", () => {
  const list = [
    { id: "shipper", value: "Shipper" },
    { id: "consignee", value: "Consignee" },
    { id: "carrier", value: "Carrier" },
  ];

  it("returns all items for empty search term", () => {
    const source = createMentionSource(list);
    let received;
    source("", (matches) => (received = matches));
    expect(received).toEqual(list);
  });

  it("filters by case-insensitive substring on value", () => {
    const source = createMentionSource(list);
    let received;
    source("con", (matches) => (received = matches));
    expect(received).toEqual([{ id: "consignee", value: "Consignee" }]);
  });

  it("passes the searchTerm through to renderList", () => {
    const source = createMentionSource(list);
    let term;
    source("shi", (_m, searchTerm) => (term = searchTerm));
    expect(term).toBe("shi");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn test src/template/variableSource.test.js`
Expected: FAIL — "Cannot find module './variableSource'".

- [ ] **Step 3: Write minimal implementation**

Create `src/template/variableSource.js`:
```js
/**
 * Normalise a variable definition into quill-mention item shape.
 * Accepts a flat map { key: value } or an array [{ id, label }].
 * @returns {Array<{id: string, value: string}>}
 */
export function toVariableList(variables) {
  if (!variables) return [];
  if (Array.isArray(variables)) {
    return variables.map((v) => ({ id: v.id, value: v.label || v.id }));
  }
  return Object.keys(variables).map((key) => ({ id: key, value: key }));
}

/**
 * Build a quill-mention `source` function that filters a variable list by
 * case-insensitive substring match on the display value.
 * @param {Array<{id: string, value: string}>} variableList
 * @returns {(searchTerm: string, renderList: Function) => void}
 */
export function createMentionSource(variableList) {
  return function source(searchTerm, renderList) {
    const term = (searchTerm || "").toLowerCase();
    const matches = variableList.filter((item) =>
      item.value.toLowerCase().includes(term)
    );
    renderList(matches, searchTerm);
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test src/template/variableSource.test.js`
Expected: PASS — 7 passing.

- [ ] **Step 5: Commit** (only if the user has approved committing)

```bash
git add src/template/variableSource.js src/template/variableSource.test.js
git commit -m "feat: add variable source helpers for editor mentions"
```

---

### Task 4: `TemplateEditor` component (editor pre-wired with `{{` variables)

**Files:**
- Create: `src/template/TemplateEditor.jsx`
- Test: `src/template/TemplateEditor.test.js` (light — prop wiring only)

**Interfaces:**
- Consumes: `RichTextEditorWrapper` (default export of `src/RichTextEditorWrapper.jsx`); `toVariableList`, `createMentionSource` from `./variableSource`.
- Produces: `export default function TemplateEditor(props)` — a thin wrapper that renders `RichTextEditorWrapper` with `allowMention`, `mentionChars={["{{"]}`, and an `onSearchMention` built from `props.variables`. Passes through `value`, `onChange`, `disabled`, `height`. `renderMentionItem` shows the variable's `value` label.
  - Props: `{ variables, value, onChange, disabled?, height? }` where `variables` is a flat map or `[{id,label}]`.

- [ ] **Step 1: Write the failing test**

Create `src/template/TemplateEditor.test.js`:
```js
import { toVariableList, createMentionSource } from "./variableSource";

// TemplateEditor is a thin wrapper; the meaningful, unit-testable logic is the
// mention source it builds from `variables`. We assert that composition here
// (rendering Quill requires a real browser, covered by the demo in Task 5).
describe("TemplateEditor variable wiring", () => {
  it("builds a working mention source from a variables map", () => {
    const source = createMentionSource(
      toVariableList({ shipper: "x", consignee: "y" })
    );
    let matches;
    source("ship", (m) => (matches = m));
    expect(matches).toEqual([{ id: "shipper", value: "shipper" }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test src/template/TemplateEditor.test.js`
Expected: FAIL initially only if imports are wrong; since it imports from `variableSource` (Task 3), it should PASS once Task 3 is done. If Task 3 is complete, this test PASSES immediately — that is expected; its purpose is to lock the wiring contract. Proceed to Step 3 to build the component the demo needs.

- [ ] **Step 3: Write the component**

Create `src/template/TemplateEditor.jsx`:
```jsx
import React from "react";
import RichTextEditorWrapper from "../RichTextEditorWrapper.jsx";
import { toVariableList, createMentionSource } from "./variableSource";

/**
 * Quill editor pre-wired for template authoring:
 * typing `{{` opens a list of available variables; selecting one inserts a
 * mention chip whose `data-id` is the variable key.
 *
 * @param {Object} props
 * @param {Object|Array} props.variables - flat map {key:value} or [{id,label}]
 * @param {string} props.value           - current template HTML
 * @param {Function} props.onChange      - (html) => void
 * @param {boolean} [props.disabled]
 * @param {string} [props.height]
 */
export default function TemplateEditor({
  variables,
  value,
  onChange,
  disabled,
  height = "300px",
}) {
  const variableList = toVariableList(variables);
  const onSearchMention = createMentionSource(variableList);

  return (
    <RichTextEditorWrapper
      value={value}
      onChange={onChange}
      disabled={disabled}
      height={height}
      allowMention
      mentionChars={["{{"]}
      showDenotationChar={false}
      onSearchMention={onSearchMention}
      renderMentionItem={(item) => item.value}
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test src/template/TemplateEditor.test.js`
Expected: PASS — 1 passing.

- [ ] **Step 5: Commit** (only if the user has approved committing)

```bash
git add src/template/TemplateEditor.jsx src/template/TemplateEditor.test.js
git commit -m "feat: add TemplateEditor wrapper wired for {{ variables"
```

---

### Task 5: Browser demo (editor + variables JSON → live rendered output)

**Files:**
- Create: `src/template/demo/index.html`
- Create: `src/template/demo/demo.jsx`
- Create: `webpack.demo.js`
- Modify: `package.json` (add `demo` script)

**Interfaces:**
- Consumes: `TemplateEditor` (Task 4), `renderTemplate` (Task 2).
- Produces: a `yarn demo` command that opens a page with the editor on the left and, on the right, an editable variables-JSON textarea plus the live `renderTemplate` output.

- [ ] **Step 1: Create the demo entry component**

Create `src/template/demo/demo.jsx`:
```jsx
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import TemplateEditor from "../TemplateEditor.jsx";
import renderTemplate from "../renderTemplate";

const VARIABLES = { shipper: "Shipper", consignee: "Consignee" };

function Demo() {
  const [html, setHtml] = useState("<p>Shipper: </p>");
  const [json, setJson] = useState(
    JSON.stringify(
      { shipper: "Commit Pvt Lmt.", consignee: "North West Lmt." },
      null,
      2
    )
  );

  let values = {};
  let jsonError = null;
  try {
    values = JSON.parse(json || "{}");
  } catch (e) {
    jsonError = e.message;
  }

  const output = jsonError ? "" : renderTemplate(html, values);

  return (
    <div style={{ display: "flex", gap: 24, padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ flex: 1 }}>
        <h3>Template (type {"{{"} to insert a variable)</h3>
        <TemplateEditor variables={VARIABLES} value={html} onChange={setHtml} />
        <h4>Stored template HTML</h4>
        <pre style={{ background: "#f5f5f5", padding: 8, overflow: "auto" }}>{html}</pre>
      </div>
      <div style={{ flex: 1 }}>
        <h3>Variables JSON</h3>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          style={{ width: "100%", height: 140, fontFamily: "monospace" }}
        />
        {jsonError && <p style={{ color: "red" }}>Invalid JSON: {jsonError}</p>}
        <h3>Rendered output</h3>
        <div
          style={{ border: "1px solid #ddd", padding: 12 }}
          dangerouslySetInnerHTML={{ __html: output }}
        />
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Demo />);
```

- [ ] **Step 2: Create the demo HTML shell**

Create `src/template/demo/index.html`:
```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>editor-hub — Template Variable Demo</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

- [ ] **Step 3: Create a dedicated demo webpack config**

Create `webpack.demo.js`:
```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/template/demo/demo.jsx",
  resolve: { extensions: [".js", ".jsx"] },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: { presets: ["@babel/preset-env", "@babel/preset-react"] },
        },
      },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "resolve-url-loader", "sass-loader"],
      },
      { test: /\.(png|jpe?g|gif|svg)$/, use: ["url-loader"] },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: "./src/template/demo/index.html" }),
  ],
  devServer: { open: true, port: 8081 },
};
```

- [ ] **Step 4: Add the demo script**

In `package.json` `scripts`, add:
```json
"demo": "webpack serve --config webpack.demo.js"
```

- [ ] **Step 5: Run the demo and verify manually**

Run: `yarn demo`
Expected — a browser tab opens at `http://localhost:8081` and you can verify end-to-end:
1. The editor shows `Shipper: `.
2. Typing `{{` opens a dropdown listing `Shipper` and `Consignee`.
3. Selecting `Shipper` inserts a chip; the "Stored template HTML" panel shows a `<span class="mention" data-id="shipper" ...>`.
4. The "Rendered output" panel shows `Shipper: Commit Pvt Lmt.` (the value from the JSON).
5. Editing the JSON updates the rendered output live; removing the `shipper` key renders `Shipper: ` (empty).

If the `{{` trigger does not open the dropdown, the fallback is to confirm quill-mention multi-char support and, if needed, adjust `mentionChars` handling in Task 4 — but the util (`getMentionCharIndex`) uses `mentionChar.length`, so `{{` is expected to work.

- [ ] **Step 6: Commit** (only if the user has approved committing)

```bash
git add src/template/demo webpack.demo.js package.json yarn.lock
git commit -m "feat: add browser demo for template variable rendering"
```

---

### Task 6: Export the public API from the library

**Files:**
- Modify: `index.js`

**Interfaces:**
- Consumes: `renderTemplate` (Task 2), `TemplateEditor` (Task 4), `toVariableList`/`createMentionSource` (Task 3).
- Produces: named exports from the package root so consumers can
  `import RichTextEditorWrapper, { TemplateEditor, renderTemplate } from "editor-hub"`.

- [ ] **Step 1: Update index.js exports**

Modify `index.js` to:
```js
import { default as RichTextEditorWrapper } from "./src/RichTextEditorWrapper.jsx";

export default RichTextEditorWrapper;
export { default as TemplateEditor } from "./src/template/TemplateEditor.jsx";
export { default as renderTemplate } from "./src/template/renderTemplate";
export { toVariableList, createMentionSource } from "./src/template/variableSource";
```

- [ ] **Step 2: Verify the library build succeeds**

Run: `yarn build`
Expected: webpack build completes with no errors; `dist/index.js` is regenerated.

- [ ] **Step 3: Run the full test suite**

Run: `yarn test`
Expected: PASS — all suites (renderTemplate, variableSource, TemplateEditor) green.

- [ ] **Step 4: Commit** (only if the user has approved committing)

```bash
git add index.js dist/index.js
git commit -m "feat: export TemplateEditor and renderTemplate from package root"
```

---

## Notes / Deferred (not in this plan)

These are intentionally out of scope for the first cut (agreed during brainstorming) and will build on this foundation later: nested variables (`shipper.address.city`), computed/derived values, conditional show/hide blocks, loops / list-bound tables, formatting filters (date/number/currency), and PDF output.
