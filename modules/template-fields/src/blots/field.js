import Quill from "quill";
import { buildFieldContent, FIELD_INPUT_CLASS } from "../helpers";

const Embed = Quill.import("blots/embed");

class TemplateFieldBlot extends Embed {
  constructor(scroll, node) {
    super(scroll, node);
    this.inputHandler = null;
  }

  static create(data) {
    const node = super.create();
    return buildFieldContent(node, data);
  }

  static value(domNode) {
    return Object.assign({}, domNode.dataset);
  }

  attach() {
    super.attach();
    if (!this.inputHandler) {
      this.inputHandler = (e) => {
        if (e.target && e.target.classList.contains(FIELD_INPUT_CLASS)) {
          this.domNode.dataset.value = e.target.value;
        }
      };
      this.domNode.addEventListener("input", this.inputHandler, false);
    }
  }

  detach() {
    super.detach();
    if (this.inputHandler) {
      this.domNode.removeEventListener("input", this.inputHandler);
      this.inputHandler = null;
    }
  }
}

TemplateFieldBlot.blotName = "template-field";
TemplateFieldBlot.tagName = "span";
TemplateFieldBlot.className = "template-field";

export default TemplateFieldBlot;
