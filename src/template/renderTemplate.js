import { buildSectionTable, esc } from "./sectionTable";
import { buildLayoutTable } from "./layoutTable";

/**
 * Build the final (data-resolved) HTML for a section, as a self-contained
 * inline-styled table so it renders correctly anywhere (preview, PDF, email).
 */
function renderSection(config, variables) {
  return buildSectionTable(config, (cell) => {
    const raw = variables ? variables[cell.value] : "";
    return raw == null ? "" : esc(String(raw));
  });
}

/**
 * Render a template HTML string by substituting its dynamic parts with values.
 *
 * Handles three things:
 *  1. Section blocks (`<div class="tpl-section" data-config="...">`) are expanded
 *     from their stored config into a resolved, inline-styled table.
 *  2. Layout blocks (`<div class="tpl-layout" data-config="...">`) are expanded
 *     from their stored split tree into resolved, inline-styled nested tables.
 *  3. Inline variable chips (`<span class="mention" data-id="KEY">`) are replaced
 *     with `variables[KEY]` (coerced to string, empty when missing/null).
 *
 * @param {string} templateHtml - stored Quill HTML
 * @param {Object} [variables]  - flat map of variable key -> value
 * @returns {string} final HTML
 */
export default function renderTemplate(templateHtml, variables = {}) {
  if (!templateHtml) return "";

  const container = document.createElement("div");
  container.innerHTML = templateHtml;

  // 1. Expand section blocks from their stored config.
  container.querySelectorAll("div.tpl-section[data-config]").forEach((node) => {
    let config = null;
    try {
      config = JSON.parse(node.getAttribute("data-config"));
    } catch (e) {
      config = null;
    }
    const wrap = document.createElement("div");
    wrap.innerHTML = config ? renderSection(config, variables) : "";
    node.replaceWith(...wrap.childNodes);
  });

  // 2. Expand layout blocks (boxed grids) from their stored tree.
  container.querySelectorAll("div.tpl-layout[data-config]").forEach((node) => {
    let tree = null;
    try {
      tree = JSON.parse(node.getAttribute("data-config"));
    } catch (e) {
      tree = null;
    }
    const wrap = document.createElement("div");
    wrap.innerHTML = tree
      ? buildLayoutTable(tree, (id) => {
          const raw = variables ? variables[id] : "";
          return raw == null ? "" : esc(String(raw));
        })
      : "";
    node.replaceWith(...wrap.childNodes);
  });

  // 3. Replace inline mention chips.
  container.querySelectorAll("span.mention[data-id]").forEach((chip) => {
    const key = chip.dataset.id;
    const value = variables ? variables[key] : undefined;
    const text = value === null || value === undefined ? "" : String(value);
    chip.replaceWith(document.createTextNode(text));
  });

  return container.innerHTML;
}
