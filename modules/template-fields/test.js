import test from "ava";
import { JSDOM } from "jsdom";
import {
  FIELD_CLASS,
  buildFieldContent,
  collectFieldValues,
  renderFilledHTML,
  blankTemplateHTML,
} from "./src/helpers.js";

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
