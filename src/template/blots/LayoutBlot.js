import Quill from "quill";
import { esc } from "../sectionTable";
import { buildLayoutTable } from "../layoutTable";
import { normalizeNode } from "../layoutTree";

const BlockEmbed = Quill.import("blots/block/embed");

/**
 * Build the in-editor preview for a layout. Variable tokens show as `{{var}}`
 * chips (resolved to real data later by renderTemplate).
 */
export function buildLayoutPreview(tree) {
  return buildLayoutTable(
    tree,
    (id) => `<span class="tpl-var" data-id="${esc(id)}">{{${esc(id)}}}</span>`,
  );
}

/**
 * A boxed grid layout block: a binary split tree of bordered cells (BL-style
 * document sections). Stored as an atomic block embed; the tree lives in the
 * `data-config` attribute so it survives serialization and can be re-edited
 * by clicking any cell.
 */
class LayoutBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    const config = normalizeNode(value);
    node.setAttribute("contenteditable", "false");
    node.setAttribute("data-config", JSON.stringify(config));
    node.innerHTML = buildLayoutPreview(config);
    return node;
  }

  static value(node) {
    try {
      return normalizeNode(JSON.parse(node.getAttribute("data-config")));
    } catch (e) {
      return normalizeNode(null);
    }
  }
}

LayoutBlot.blotName = "layout";
LayoutBlot.tagName = "div";
LayoutBlot.className = "tpl-layout";

Quill.register("formats/layout", LayoutBlot, true);

export default LayoutBlot;
