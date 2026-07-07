import Quill from "quill";
import { buildSectionTable, esc } from "../sectionTable";

const BlockEmbed = Quill.import("blots/block/embed");

function normalize(value) {
  const v = value || {};
  return {
    columns: v.columns === 4 ? 4 : 2,
    dividerTop: !!v.dividerTop,
    dividerBetween: !!v.dividerBetween,
    rows: Array.isArray(v.rows) ? v.rows : [],
  };
}

/**
 * Build the in-editor preview table for a section. Values show as `{{var}}`
 * chips (they are resolved to real data later by renderTemplate).
 */
export function buildSectionPreview(config) {
  return buildSectionTable(
    normalize(config),
    (cell) =>
      `<span class="tpl-var" data-id="${esc(cell.value)}">{{${esc(
        cell.value,
      )}}}</span>`,
  );
}

/**
 * A structured "section" block: a config-driven grid of aligned label : value
 * pairs (2 or 4 columns) with optional top / between-column dividers. Stored as
 * an atomic block embed; its config lives in the `data-config` attribute so it
 * survives serialization and can be re-edited.
 */
class SectionBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    const config = normalize(value);
    node.setAttribute("contenteditable", "false");
    node.setAttribute("data-config", JSON.stringify(config));
    node.innerHTML = buildSectionPreview(config);
    return node;
  }

  static value(node) {
    try {
      return normalize(JSON.parse(node.getAttribute("data-config")));
    } catch (e) {
      return normalize(null);
    }
  }
}

SectionBlot.blotName = "section";
SectionBlot.tagName = "div";
SectionBlot.className = "tpl-section";

Quill.register("formats/section", SectionBlot, true);

export default SectionBlot;
