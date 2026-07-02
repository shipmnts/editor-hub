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
