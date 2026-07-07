import { esc } from "./sectionTable";
import { normalizeNode, pathToString } from "./layoutTree";

/**
 * Build the HTML for a layout tree as nested tables with inline styles, so it
 * renders identically in the editor preview, the final output, PDF and email
 * (flexbox is not print-safe; nested tables are). Shared by LayoutBlot
 * (preview) and renderTemplate (final output), mirroring sectionTable.js.
 *
 * Vertical borders drawn on the <td> span the full row height, so a short
 * left cell still shows its line against a tall right cell (BL-style boxes).
 *
 * @param {Object} tree          - layout tree root (see layoutTree.js)
 * @param {Function} renderToken - (variableId) => HTML for a {{token}}
 * @returns {string} table HTML
 */
export function buildLayoutTable(tree, renderToken) {
  const root = normalizeNode(tree);
  // Uniform shape: the root always renders as a single-cell table so cell
  // borders/padding land on a <td> at every level.
  if (root.type === "cell") {
    return wrap(`<tr>${cellTd(root, [], 100, renderToken)}</tr>`);
  }
  return renderSplit(root, [], renderToken);
}

// `fill` makes a nested table stretch to its parent cell's height so sibling
// columns of unequal content always align (no unbordered gap at the bottom).
function wrap(inner, fill) {
  const h = fill ? "height:100%;" : "";
  return (
    `<table style="width:100%;${h}border-collapse:collapse;table-layout:fixed;border:0;">` +
    `<tbody>${inner}</tbody></table>`
  );
}

function renderNodeInTd(node, path, widthPct, renderToken) {
  if (node.type === "split") {
    // Structural td: no borders/padding of its own, nested table fills it.
    const w = widthPct != null ? `width:${widthPct}%;` : "";
    return (
      `<td style="${w}border:0;padding:0;vertical-align:top;">` +
      renderSplit(node, path, renderToken, true) +
      "</td>"
    );
  }
  return cellTd(node, path, widthPct, renderToken);
}

function renderSplit(split, path, renderToken, fill) {
  const [a, b] = split.children;
  if (split.direction === "vertical") {
    return wrap(
      "<tr>" +
        renderNodeInTd(a, path.concat(0), split.ratio[0], renderToken) +
        renderNodeInTd(b, path.concat(1), split.ratio[1], renderToken) +
        "</tr>",
      fill,
    );
  }
  // Horizontal split: two stacked rows; heights grow with content, and when
  // the column is stretched the extra space is absorbed (see `fill`).
  return wrap(
    `<tr>${renderNodeInTd(a, path.concat(0), null, renderToken)}</tr>` +
      `<tr>${renderNodeInTd(b, path.concat(1), null, renderToken)}</tr>`,
    fill,
  );
}

function cellTd(cell, path, widthPct, renderToken) {
  const b = cell.borders;
  const border =
    (b.top ? "border-top:1px solid #000;" : "") +
    (b.right ? "border-right:1px solid #000;" : "") +
    (b.bottom ? "border-bottom:1px solid #000;" : "") +
    (b.left ? "border-left:1px solid #000;" : "");
  const w = widthPct != null ? `width:${widthPct}%;` : "";
  // On a <td>, height behaves as min-height: the cell still grows with content.
  const h = cell.minHeight > 0 ? `height:${cell.minHeight}px;` : "";
  const style = `${w}${h}border:0;${border}padding:6px 8px;vertical-align:top;`;
  const heading = cell.heading
    ? `<div style="font-weight:bold;font-size:12px;margin-bottom:4px;">${esc(
        cell.heading,
      )}</div>`
    : "";
  return (
    `<td class="tpl-layout-cell" data-path="${pathToString(path)}" style="${style}">` +
    heading +
    `<div style="min-height:18px;">${contentToHtml(cell.content, renderToken)}</div>` +
    "</td>"
  );
}

/**
 * Turn a cell's plain-text content into HTML: text is escaped, newlines
 * become <br>, and `{{variable_id}}` tokens are rendered via `renderToken`.
 */
export function contentToHtml(content, renderToken) {
  const parts = String(content == null ? "" : content).split(
    /(\{\{\s*[\w.]+\s*\}\})/g,
  );
  return parts
    .map((part) => {
      const m = part.match(/^\{\{\s*([\w.]+)\s*\}\}$/);
      if (m) return renderToken(m[1]);
      return esc(part).replace(/\n/g, "<br>");
    })
    .join("");
}
