import { esc } from "./sectionTable";
import {
  getNode,
  updateAt,
  splitAt,
  mergeAt,
  getWidthAt,
  setWidthAt,
} from "./layoutTree";

/**
 * Open a small modal to edit one cell of a layout tree. Vanilla DOM so it
 * stays self-contained (no React coupling inside the library), same pattern
 * as sectionEditor.js.
 *
 * The modal edits the cell's heading / content / borders / width / min
 * height, and offers
 * structural actions: split vertically (draw a vertical line), split
 * horizontally (draw a horizontal line), and merge (remove the line so the
 * sibling takes this cell's space).
 *
 * @param {Object} root          - current layout tree root
 * @param {Array}  path          - path of the clicked cell (child indexes)
 * @param {Array}  variableList  - [{id, value}] available variables (hint)
 * @param {Function} onSave      - called with the new tree root
 */
export function openLayoutCellEditor(root, path, variableList, onSave) {
  const cell = getNode(root, path);
  if (!cell || cell.type !== "cell") return;

  const available = (variableList || []).map((v) => v.id).join(", ");
  const width = getWidthAt(root, path);
  const canMerge = path.length > 0;

  const backdrop = document.createElement("div");
  backdrop.className = "tpl-section-editor-backdrop";

  const panel = document.createElement("div");
  panel.className = "tpl-section-editor";
  panel.innerHTML = `
    <h4>Edit cell</h4>
    <label>Heading</label>
    <input type="text" class="tpl-heading" />
    <label>Content — use <code>{{variable_id}}</code> for values</label>
    <textarea class="tpl-content" spellcheck="false"></textarea>
    <div class="tpl-hint">Available variables: ${esc(available)}</div>
    <label>Borders</label>
    <div class="tpl-borders">
      <label><input type="checkbox" class="tpl-btop" /> Top</label>
      <label><input type="checkbox" class="tpl-bright" /> Right</label>
      <label><input type="checkbox" class="tpl-bbottom" /> Bottom</label>
      <label><input type="checkbox" class="tpl-bleft" /> Left</label>
    </div>
    ${
      width != null
        ? `<label>Width % <input type="number" class="tpl-width" min="5" max="95" step="5" /></label>`
        : ""
    }
    <label>Min height (px) — 0 = fit content
      <input type="number" class="tpl-minheight" min="0" max="2000" step="10" />
    </label>
    <label>Draw lines</label>
    <div class="tpl-structure">
      <button type="button" class="tpl-split-v">│ Split vertically</button>
      <button type="button" class="tpl-split-h">― Split horizontally</button>
      ${canMerge ? '<button type="button" class="tpl-merge">Merge with sibling</button>' : ""}
    </div>
    <div class="tpl-actions">
      <button type="button" class="tpl-cancel">Cancel</button>
      <button type="button" class="tpl-save">Save</button>
    </div>`;

  backdrop.appendChild(panel);
  document.body.appendChild(backdrop);

  panel.querySelector(".tpl-heading").value = cell.heading || "";
  panel.querySelector(".tpl-content").value = cell.content || "";
  panel.querySelector(".tpl-btop").checked = !!cell.borders.top;
  panel.querySelector(".tpl-bright").checked = !!cell.borders.right;
  panel.querySelector(".tpl-bbottom").checked = !!cell.borders.bottom;
  panel.querySelector(".tpl-bleft").checked = !!cell.borders.left;
  if (width != null) panel.querySelector(".tpl-width").value = String(width);
  panel.querySelector(".tpl-minheight").value = String(cell.minHeight || 0);

  const close = () => {
    if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
  };

  // Read the form back into a new tree (field edits + optional width change).
  const applyFields = () => {
    const newCell = {
      type: "cell",
      heading: panel.querySelector(".tpl-heading").value,
      content: panel.querySelector(".tpl-content").value,
      minHeight: parseInt(panel.querySelector(".tpl-minheight").value, 10) || 0,
      borders: {
        top: panel.querySelector(".tpl-btop").checked,
        right: panel.querySelector(".tpl-bright").checked,
        bottom: panel.querySelector(".tpl-bbottom").checked,
        left: panel.querySelector(".tpl-bleft").checked,
      },
    };
    let newRoot = updateAt(root, path, newCell);
    const widthInput = panel.querySelector(".tpl-width");
    if (widthInput) {
      newRoot = setWidthAt(newRoot, path, parseInt(widthInput.value, 10));
    }
    return newRoot;
  };

  panel.querySelector(".tpl-cancel").onclick = close;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) close();
  };

  panel.querySelector(".tpl-save").onclick = () => {
    close();
    onSave(applyFields());
  };
  panel.querySelector(".tpl-split-v").onclick = () => {
    close();
    onSave(splitAt(applyFields(), path, "vertical"));
  };
  panel.querySelector(".tpl-split-h").onclick = () => {
    close();
    onSave(splitAt(applyFields(), path, "horizontal"));
  };
  const mergeBtn = panel.querySelector(".tpl-merge");
  if (mergeBtn) {
    mergeBtn.onclick = () => {
      close();
      onSave(mergeAt(applyFields(), path));
    };
  }
}
