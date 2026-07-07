function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Build a borderless, evenly-columned label : value table for a section.
 * Shared by the in-editor preview and the final rendered output so they look
 * identical. Borders are inline (`border:0`) so they override Quill's table CSS.
 *
 * @param {Object} config       - { columns, dividerTop, dividerBetween, rows }
 * @param {Function} renderValue - (cell) => HTML string for the value cell
 * @returns {string} table HTML
 */
export function buildSectionTable(config, renderValue) {
  const columns = config && config.columns === 4 ? 4 : 2;
  const rows = config && Array.isArray(config.rows) ? config.rows : [];
  const dividerBetween = !!(config && config.dividerBetween);
  const topBorder = config && config.dividerTop ? "border-top:1px solid #ccc;" : "";

  // Fixed layout so columns split evenly into halves/quarters (like a BL grid).
  const groupW = 100 / columns;
  const labelW = (groupW * 0.4).toFixed(2);
  const colonW = 2;
  const valueW = (groupW - labelW - colonW).toFixed(2);

  let colgroup = "";
  for (let c = 0; c < columns; c++) {
    colgroup +=
      `<col style="width:${labelW}%" />` +
      `<col style="width:${colonW}%" />` +
      `<col style="width:${valueW}%" />`;
  }

  let html =
    `<table style="width:100%;border-collapse:collapse;table-layout:fixed;border:0;${topBorder}">` +
    `<colgroup>${colgroup}</colgroup><tbody>`;

  for (let i = 0; i < rows.length; i += columns) {
    html += "<tr>";
    for (let c = 0; c < columns; c++) {
      const cell = rows[i + c];
      const first = c > 0;
      const labelStyle =
        "border:0;padding:6px 8px;vertical-align:top;" +
        (first ? "padding-left:28px;" : "") +
        (dividerBetween && first ? "border-left:1px solid #e0e0e0;" : "");
      const colonStyle = "border:0;padding:6px 4px;vertical-align:top;";
      const valueStyle = "border:0;padding:6px 8px;vertical-align:top;";
      const label = cell ? esc(cell.label) : "";
      const value = cell ? renderValue(cell) : "";
      html += `<td style="${labelStyle}">${label}</td>`;
      html += `<td style="${colonStyle}">${cell ? ":" : ""}</td>`;
      html += `<td style="${valueStyle}">${value}</td>`;
    }
    html += "</tr>";
  }

  html += "</tbody></table>";
  return html;
}

export { esc };
