import Quill from "quill";

const BlockEmbed = Quill.import("blots/block/embed");

/**
 * A standalone horizontal divider (`<hr>`), insertable anywhere in the document.
 * Registered as the `divider` format; insert with
 * `quill.insertEmbed(index, "divider", true, "user")`.
 */
class DividerBlot extends BlockEmbed {}

DividerBlot.blotName = "divider";
DividerBlot.tagName = "hr";
DividerBlot.className = "tpl-divider";

Quill.register("formats/divider", DividerBlot, true);

export default DividerBlot;
