function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Open a small modal to edit a section's config. Vanilla DOM so it stays
 * self-contained (no React coupling inside the library).
 *
 * @param {Object} config        - current section config
 * @param {Array}  variableList  - [{id, value}] available variables (hint)
 * @param {Function} onSave      - called with the new config on Save
 */
export function openSectionEditor(config, variableList, onSave) {
  const cfg = config || {};
  const rowsText = (cfg.rows || [])
    .map((r) => `${r.label || ""} = ${r.value || ""}`)
    .join("\n");
  const available = (variableList || []).map((v) => v.id).join(", ");

  const backdrop = document.createElement("div");
  backdrop.className = "tpl-section-editor-backdrop";

  const panel = document.createElement("div");
  panel.className = "tpl-section-editor";
  panel.innerHTML = `
    <h4>Edit section</h4>
    <label>Columns</label>
    <select class="tpl-cols">
      <option value="2">2 columns</option>
      <option value="4">4 columns</option>
    </select>
    <label><input type="checkbox" class="tpl-dtop" /> Divider on top</label>
    <label><input type="checkbox" class="tpl-dbetween" /> Divider between columns</label>
    <label>Rows — one per line: <code>Label = variable_id</code></label>
    <textarea class="tpl-rows" spellcheck="false"></textarea>
    <div class="tpl-hint">Available variables: ${esc(available)}</div>
    <div class="tpl-actions">
      <button type="button" class="tpl-cancel">Cancel</button>
      <button type="button" class="tpl-save">Save</button>
    </div>`;

  backdrop.appendChild(panel);
  document.body.appendChild(backdrop);

  panel.querySelector(".tpl-cols").value = String(cfg.columns === 4 ? 4 : 2);
  panel.querySelector(".tpl-dtop").checked = !!cfg.dividerTop;
  panel.querySelector(".tpl-dbetween").checked = !!cfg.dividerBetween;
  panel.querySelector(".tpl-rows").value = rowsText;

  const close = () => {
    if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
  };

  panel.querySelector(".tpl-cancel").onclick = close;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) close();
  };

  panel.querySelector(".tpl-save").onclick = () => {
    const columns =
      parseInt(panel.querySelector(".tpl-cols").value, 10) === 4 ? 4 : 2;
    const dividerTop = panel.querySelector(".tpl-dtop").checked;
    const dividerBetween = panel.querySelector(".tpl-dbetween").checked;
    const rows = panel
      .querySelector(".tpl-rows")
      .value.split("\n")
      .map((line) => {
        const idx = line.indexOf("=");
        if (idx === -1) {
          const label = line.trim();
          return label ? { label, value: "" } : null;
        }
        return {
          label: line.slice(0, idx).trim(),
          value: line.slice(idx + 1).trim(),
        };
      })
      .filter(Boolean);
    close();
    onSave({ columns, dividerTop, dividerBetween, rows });
  };
}
