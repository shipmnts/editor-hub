# Template Fields — Thin Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One fillable field type (single-line text) working end-to-end in editor-hub: insert in author mode → fill in fill mode → export template HTML, values JSON, and rendered HTML.

**Architecture:** A single Quill embed blot (`TemplateFieldBlot`, modeled on the existing `MentionBlot`) renders a native `<input>` and stores metadata in `dataset`. All serialization/collection logic lives in pure DOM helper functions (unit-testable with jsdom). `RichTextEditorWrapper` gains a `mode` prop (`"author" | "fill"`) and four ref methods. A demo page provides manual verification.

**Tech Stack:** Quill v2 (`quill@^2.0.0-dev.3`), React (peer), webpack 4 UMD build, ava 5 + `@babel/register` for tests, jsdom for DOM in tests.

## Global Constraints

- Existing `RichTextEditorWrapper` behavior must be unchanged when the new `mode` prop is absent (spec: "default: existing behavior unchanged when prop absent").
- Field metadata dataset keys, exactly: `fieldId`, `fieldType`, `label`, `required`, `value` (serialized as `data-field-id`, `data-field-type`, `data-label`, `data-required`, `data-value`).
- Blot registration: `blotName = "template-field"`, `tagName = "span"`, `className = "template-field"`.
- `getValues()` returns `{ values: {[fieldId]: string}, missingRequired: string[] }` — library never blocks on missing required fields.
- v1 slice scope: `fieldType: "text"` only. The helper/blot code paths accept a `fieldType` but only text is wired into the UI/demo. No dropdowns, conditions, repeating rows, signatures.
- Node tooling: repo has `yarn.lock` — use `yarn`, not npm.

---

### Task 1: Test infrastructure + pure DOM helpers

**Files:**
- Create: `modules/template-fields/src/helpers.js`
- Create: `modules/template-fields/test.js`
- Modify: `package.json` (add `test` script, add `jsdom` devDependency)

**Interfaces:**
- Produces (consumed by Tasks 2 and 3):
  - `FIELD_CLASS: string` — `"template-field"`
  - `buildFieldContent(node: HTMLElement, data: {fieldId, fieldType, label, required, value}) => HTMLElement` — empties `node`, appends the `<input>`/`<textarea>`, copies `data` onto `node.dataset`, returns `node`.
  - `collectFieldValues(root: HTMLElement) => { values: Record<string,string>, missingRequired: string[] }`
  - `renderFilledHTML(html: string, doc: Document) => string` — field spans replaced by their plain-text values.
  - `blankTemplateHTML(html: string, doc: Document) => string` — field values cleared, structure kept.

- [ ] **Step 1: Install dependencies and add test tooling**

```bash
cd /Users/chintukumarbhanderi/Shipments/editor-hub
yarn install
yarn add --dev jsdom@^22.1.0
```

Then in `package.json`, add to `"scripts"`:

```json
"test": "ava"
```

- [ ] **Step 2: Verify existing test suite runs**

Run: `yarn test`
Expected: PASS — 2 passing tests from `modules/quill-mention/test.js` ("has valid chars", "has invalid chars").

If ava reports "Couldn't find any files to test" (its default glob may not match `modules/**/test.js`), add to the existing `"ava"` block in `package.json`:

```json
"files": ["modules/**/test.js"]
```

and re-run. Do not continue on a broken harness.

- [ ] **Step 3: Write the failing tests**

Create `modules/template-fields/test.js`:

```js
import test from "ava";
import { JSDOM } from "jsdom";
import {
  FIELD_CLASS,
  buildFieldContent,
  collectFieldValues,
  renderFilledHTML,
  blankTemplateHTML,
} from "./src/helpers";

const dom = () => new JSDOM("<!doctype html><body></body>").window.document;

const fieldSpan = (doc, data) => {
  const node = doc.createElement("span");
  node.className = FIELD_CLASS;
  return buildFieldContent(node, data);
};

test("buildFieldContent creates a text input with label placeholder and dataset", (t) => {
  const doc = dom();
  const node = fieldSpan(doc, {
    fieldId: "f1",
    fieldType: "text",
    label: "Shipper Name",
    required: "true",
    value: "",
  });
  const input = node.querySelector("input");
  t.truthy(input);
  t.is(input.type, "text");
  t.is(input.placeholder, "Shipper Name");
  t.is(node.dataset.fieldId, "f1");
  t.is(node.dataset.fieldType, "text");
  t.is(node.dataset.required, "true");
  t.is(node.dataset.value, "");
});

test("buildFieldContent restores an existing value into the input", (t) => {
  const doc = dom();
  const node = fieldSpan(doc, {
    fieldId: "f1",
    fieldType: "text",
    label: "Shipper Name",
    required: "false",
    value: "ACME Corp",
  });
  t.is(node.querySelector("input").value, "ACME Corp");
  t.is(node.dataset.value, "ACME Corp");
});

test("collectFieldValues gathers values and flags empty required fields", (t) => {
  const doc = dom();
  const root = doc.createElement("div");
  root.appendChild(
    fieldSpan(doc, { fieldId: "f1", fieldType: "text", label: "A", required: "true", value: "hello" })
  );
  root.appendChild(
    fieldSpan(doc, { fieldId: "f2", fieldType: "text", label: "B", required: "true", value: "" })
  );
  root.appendChild(
    fieldSpan(doc, { fieldId: "f3", fieldType: "text", label: "C", required: "false", value: "" })
  );
  const { values, missingRequired } = collectFieldValues(root);
  t.deepEqual(values, { f1: "hello", f2: "", f3: "" });
  t.deepEqual(missingRequired, ["f2"]);
});

test("renderFilledHTML replaces field spans with their plain values", (t) => {
  const doc = dom();
  const root = doc.createElement("div");
  root.innerHTML = "<p>Shipper: </p>";
  root.querySelector("p").appendChild(
    fieldSpan(doc, { fieldId: "f1", fieldType: "text", label: "Shipper", required: "false", value: "ACME Corp" })
  );
  const html = renderFilledHTML(root.innerHTML, doc);
  t.is(html, "<p>Shipper: ACME Corp</p>");
});

test("blankTemplateHTML clears values but keeps field structure", (t) => {
  const doc = dom();
  const root = doc.createElement("div");
  root.appendChild(
    fieldSpan(doc, { fieldId: "f1", fieldType: "text", label: "Shipper", required: "false", value: "ACME Corp" })
  );
  const blanked = blankTemplateHTML(root.innerHTML, doc);
  const check = doc.createElement("div");
  check.innerHTML = blanked;
  const span = check.querySelector(`.${FIELD_CLASS}`);
  t.truthy(span);
  t.is(span.dataset.value, "");
  t.is(span.dataset.fieldId, "f1");
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `yarn test`
Expected: FAIL — the 5 new tests error with "Cannot find module './src/helpers'"; the 2 mention tests still pass.

- [ ] **Step 5: Write the helpers**

Create `modules/template-fields/src/helpers.js`:

```js
export const FIELD_CLASS = "template-field";
export const FIELD_INPUT_CLASS = "template-field-input";

const INPUT_TYPES = { text: "text", number: "number", date: "date" };

export function buildFieldContent(node, data) {
  const doc = node.ownerDocument;
  node.innerHTML = "";
  let input;
  if (data.fieldType === "textarea") {
    input = doc.createElement("textarea");
    input.rows = 3;
  } else {
    input = doc.createElement("input");
    input.type = INPUT_TYPES[data.fieldType] || "text";
  }
  input.className = FIELD_INPUT_CLASS;
  input.placeholder = data.label || "";
  input.value = data.value || "";
  node.appendChild(input);
  Object.keys(data).forEach((key) => {
    node.dataset[key] = data[key];
  });
  return node;
}

export function collectFieldValues(root) {
  const values = {};
  const missingRequired = [];
  root.querySelectorAll(`.${FIELD_CLASS}`).forEach((el) => {
    const { fieldId, required } = el.dataset;
    if (!fieldId) return;
    const value = el.dataset.value || "";
    values[fieldId] = value;
    if (required === "true" && !value) missingRequired.push(fieldId);
  });
  return { values, missingRequired };
}

export function renderFilledHTML(html, doc) {
  const div = doc.createElement("div");
  div.innerHTML = html;
  div.querySelectorAll(`.${FIELD_CLASS}`).forEach((el) => {
    el.replaceWith(doc.createTextNode(el.dataset.value || ""));
  });
  return div.innerHTML;
}

export function blankTemplateHTML(html, doc) {
  const div = doc.createElement("div");
  div.innerHTML = html;
  div.querySelectorAll(`.${FIELD_CLASS}`).forEach((el) => {
    el.dataset.value = "";
    const input = el.querySelector("input, textarea");
    if (input) input.removeAttribute("value");
  });
  return div.innerHTML;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `yarn test`
Expected: PASS — 7 tests (5 new + 2 existing).

- [ ] **Step 7: Commit**

```bash
git add modules/template-fields package.json yarn.lock
git commit -m "feat: add template-field DOM helpers with tests"
```

---

### Task 2: TemplateFieldBlot + registration + styles

**Files:**
- Create: `modules/template-fields/src/blots/field.js`
- Create: `modules/template-fields/src/template-fields.css`
- Modify: `src/RichTextEditorWrapper.jsx` (imports at top; registration block at lines 119–151)

**Interfaces:**
- Consumes: `buildFieldContent`, `FIELD_CLASS`, `FIELD_INPUT_CLASS` from `modules/template-fields/src/helpers.js` (Task 1).
- Produces (consumed by Task 3): a registered Quill embed blot named `"template-field"` — insertable via `quill.insertEmbed(index, "template-field", data)`; typing in its input keeps `domNode.dataset.value` in sync.

- [ ] **Step 1: Write the blot**

Create `modules/template-fields/src/blots/field.js` (same structure as `modules/quill-mention/src/blots/mention.js`):

```js
import Quill from "quill";
import { buildFieldContent, FIELD_INPUT_CLASS } from "../helpers";

const Embed = Quill.import("blots/embed");

class TemplateFieldBlot extends Embed {
  constructor(scroll, node) {
    super(scroll, node);
    this.inputHandler = null;
  }

  static create(data) {
    const node = super.create();
    return buildFieldContent(node, data);
  }

  static value(domNode) {
    return Object.assign({}, domNode.dataset);
  }

  attach() {
    super.attach();
    if (!this.inputHandler) {
      this.inputHandler = (e) => {
        if (e.target && e.target.classList.contains(FIELD_INPUT_CLASS)) {
          this.domNode.dataset.value = e.target.value;
        }
      };
      this.domNode.addEventListener("input", this.inputHandler, false);
    }
  }

  detach() {
    super.detach();
    if (this.inputHandler) {
      this.domNode.removeEventListener("input", this.inputHandler);
      this.inputHandler = null;
    }
  }
}

TemplateFieldBlot.blotName = "template-field";
TemplateFieldBlot.tagName = "span";
TemplateFieldBlot.className = "template-field";

export default TemplateFieldBlot;
```

- [ ] **Step 2: Write the styles**

Create `modules/template-fields/src/template-fields.css`:

```css
.template-field {
  display: inline-block;
}

.template-field .template-field-input {
  border: 1px dashed #8c8c8c;
  border-radius: 3px;
  background: #fffbe6;
  padding: 2px 6px;
  font: inherit;
  min-width: 120px;
}

/* Author mode: fields are placed, not filled */
.template-mode-author .template-field-input {
  pointer-events: none;
  background: #eef2ff;
  border-style: dotted;
}

/* Fill mode: locked text, active fields */
.template-mode-fill .ql-editor {
  background: #fafafa;
}
.template-mode-fill .template-field-input {
  background: #ffffff;
  border-style: solid;
  border-color: #4c6ef5;
}
```

- [ ] **Step 3: Register blot and import CSS in the wrapper**

In `src/RichTextEditorWrapper.jsx`, add imports after line 8 (`import "./richtext.css";`):

```js
import TemplateFieldBlot from "../modules/template-fields/src/blots/field";
import "../modules/template-fields/src/template-fields.css";
```

Inside the existing `if (Quill && !quill) { try { ... } }` registration block, after `Quill.register("blots/mention", mention.MentionBlot);` (line 142), add:

```js
Quill.register("blots/template-field", TemplateFieldBlot);
```

- [ ] **Step 4: Verify the library builds and tests still pass**

Run: `yarn build && yarn test`
Expected: webpack completes without errors (warnings acceptable if pre-existing); 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add modules/template-fields src/RichTextEditorWrapper.jsx
git commit -m "feat: add TemplateFieldBlot embed and styles"
```

---

### Task 3: `mode` prop + ref API on RichTextEditorWrapper

**Files:**
- Modify: `src/RichTextEditorWrapper.jsx` (props at lines 33–52, `useImperativeHandle` at lines 111–117, new effect near line 170)

**Interfaces:**
- Consumes: `"template-field"` blot (Task 2); `collectFieldValues`, `renderFilledHTML`, `blankTemplateHTML` (Task 1).
- Produces (consumed by the demo, Task 4, and by consuming apps):
  - Prop `mode?: "author" | "fill"` — undefined preserves current behavior exactly.
  - Ref methods:
    - `insertField({ type?: string, label?: string, required?: boolean, fieldId?: string }) => string | null` — inserts at cursor, returns the fieldId (auto-generated when omitted), null if quill not ready.
    - `getTemplate() => string` — blanked HTML template.
    - `getValues() => { values: Record<string,string>, missingRequired: string[] }`
    - `getRenderedHTML() => string`

- [ ] **Step 1: Add the `mode` prop and helper imports**

In `src/RichTextEditorWrapper.jsx`, add to the imports:

```js
import {
  collectFieldValues,
  renderFilledHTML,
  blankTemplateHTML,
} from "../modules/template-fields/src/helpers";
```

Add `mode` to the destructured props (after `placeholder = "",` on line 51):

```js
    mode, // undefined | "author" | "fill"
```

- [ ] **Step 2: Extend the imperative ref API**

Replace the existing `useImperativeHandle` block (lines 111–117) with:

```js
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (quillRef.current) {
        quillRef.current.querySelector(".ql-editor")?.focus();
      }
    },
    insertField: ({ type = "text", label = "", required = false, fieldId } = {}) => {
      if (!quill) return null;
      const id = fieldId || `f_${Math.random().toString(36).slice(2, 10)}`;
      const range = quill.getSelection(true);
      quill.insertEmbed(
        range.index,
        "template-field",
        {
          fieldId: id,
          fieldType: type,
          label,
          required: String(required),
          value: "",
        },
        "user"
      );
      quill.setSelection(range.index + 1, 0);
      return id;
    },
    getTemplate: () => (quill ? blankTemplateHTML(quill.root.innerHTML, document) : ""),
    getValues: () =>
      quill ? collectFieldValues(quill.root) : { values: {}, missingRequired: [] },
    getRenderedHTML: () => (quill ? renderFilledHTML(quill.root.innerHTML, document) : ""),
  }));
```

- [ ] **Step 3: Add the mode effect**

After the existing `useEffect` that ends at line 170 (`}, [quill, quillRef]);`), add:

```js
  useEffect(() => {
    if (!quill) return;
    quill.enable(!(disabled || mode === "fill"));
    const container = quillRef.current;
    if (container) {
      container.classList.remove("template-mode-author", "template-mode-fill");
      if (mode) container.classList.add(`template-mode-${mode}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quill, mode, disabled]);
```

Note: this effect runs after the original `quill.enable(!disabled)` on line 167 and takes precedence; when `mode` is undefined it computes the identical `!(disabled || false)`, so legacy behavior is unchanged.

- [ ] **Step 4: Verify build and tests**

Run: `yarn build && yarn test`
Expected: build succeeds; 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/RichTextEditorWrapper.jsx
git commit -m "feat: add mode prop and template field ref API to RichTextEditorWrapper"
```

---

### Task 4: Demo page + manual end-to-end verification

**Files:**
- Create: `demo/index.jsx`
- Create: `demo/index.html`
- Create: `webpack.demo.config.js`
- Modify: `package.json` (add `demo` script; add `react`, `react-dom`, `html-webpack-plugin` devDependencies)

**Interfaces:**
- Consumes: `RichTextEditorWrapper` default export from `index.js` with the Task 3 API (`mode`, `insertField`, `getTemplate`, `getValues`, `getRenderedHTML`).
- Produces: `yarn demo` → browser page at `http://localhost:8080` for manual verification. Nothing downstream consumes this.

- [ ] **Step 1: Add dev dependencies and script**

```bash
yarn add --dev react@^18.2.0 react-dom@^18.2.0 html-webpack-plugin@^4.5.2
```

In `package.json` `"scripts"`, add:

```json
"demo": "webpack-dev-server --config webpack.demo.config.js --open --mode development"
```

- [ ] **Step 2: Create the demo webpack config**

Create `webpack.demo.config.js`:

```js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const baseConfig = require("./webpack.config.js");

module.exports = {
  ...baseConfig,
  mode: "development",
  entry: "./demo/index.jsx",
  output: {
    path: path.resolve(__dirname, "demo-dist"),
    filename: "demo.js",
  },
  externals: {}, // bundle react for the demo
  plugins: [
    new HtmlWebpackPlugin({ template: "./demo/index.html" }),
  ],
  devServer: {
    port: 8080,
  },
};
```

- [ ] **Step 3: Create the demo HTML shell**

Create `demo/index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>editor-hub template fields demo</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

- [ ] **Step 4: Create the demo app**

Create `demo/index.jsx`:

```jsx
import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import RichTextEditorWrapper from "../index.js";

function Demo() {
  const editorRef = useRef(null);
  const [mode, setMode] = useState("author");
  const [output, setOutput] = useState("");

  const show = (label, data) =>
    setOutput(`${label}:\n${typeof data === "string" ? data : JSON.stringify(data, null, 2)}`);

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Template fields demo — mode: {mode}</h2>
      <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setMode(mode === "author" ? "fill" : "author")}>
          Switch to {mode === "author" ? "fill" : "author"} mode
        </button>
        <button
          disabled={mode !== "author"}
          onClick={() =>
            editorRef.current?.insertField({
              type: "text",
              label: "Shipper Name",
              required: true,
            })
          }
        >
          + Text field
        </button>
        <button onClick={() => show("Template HTML", editorRef.current?.getTemplate())}>
          Get template
        </button>
        <button onClick={() => show("Values JSON", editorRef.current?.getValues())}>
          Get values
        </button>
        <button onClick={() => show("Rendered HTML", editorRef.current?.getRenderedHTML())}>
          Get rendered HTML
        </button>
      </div>
      <RichTextEditorWrapper ref={editorRef} mode={mode} height="300px" />
      <pre
        style={{ background: "#f5f5f5", padding: 12, whiteSpace: "pre-wrap", marginTop: 12 }}
      >
        {output}
      </pre>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Demo />);
```

- [ ] **Step 5: Manual verification checklist**

Run: `yarn demo` and verify in the browser, in order:

1. Author mode: type fixed text ("Shipper: "), click **+ Text field** — a dashed chip appears inline; clicking it does NOT focus the input (pointer-events off).
2. **Get template** shows HTML containing `<span class="template-field" data-field-id="..." data-field-type="text" data-label="Shipper Name" data-required="true" data-value="">`.
3. Switch to fill mode: the surrounding text is NOT editable (typing outside fields does nothing), but clicking the field input focuses it and typing works.
4. Type "ACME Corp" in the field. **Get values** returns `{ "values": { "f_...": "ACME Corp" }, "missingRequired": [] }`.
5. Clear the field. **Get values** now lists the fieldId under `missingRequired`.
6. Refill it. **Get rendered HTML** returns the paragraph with `ACME Corp` as plain text and NO `<span class="template-field">` / `<input>` remaining.
7. Print-to-PDF sanity: browser Cmd+P on the page — the rendered content is printable (PDF pipeline itself is out of scope, consumer-side per spec).

Record any failures; fix before committing (use superpowers:systematic-debugging if behavior is unexpected — likely suspects: Quill embed guard characters in output HTML, input events swallowed by Quill).

- [ ] **Step 6: Run the full suite one last time**

Run: `yarn build && yarn test`
Expected: build OK, 7 tests pass.

- [ ] **Step 7: Commit**

```bash
git add demo webpack.demo.config.js package.json yarn.lock
git commit -m "feat: add template-fields demo page for manual verification"
```

---

## Out of scope for this slice (next iterations)

Multi-line/date/number wiring in UI (blot+helpers already accept the types), field config popover in author mode, dropdowns, `getTemplate` Delta variant, PDF generation, conditions/repeating rows (accepted Quill risk per spec).
