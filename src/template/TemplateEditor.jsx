import React, { useEffect, useRef } from "react";
import Quill from "quill";
import RichTextEditorWrapper from "../RichTextEditorWrapper.jsx";
import { toVariableList, createMentionSource } from "./variableSource";
import { openSectionEditor } from "./sectionEditor";
import { openLayoutCellEditor } from "./layoutEditor";
import { defaultCell, parsePath } from "./layoutTree";
import "./blots"; // registers divider + section blots on the Quill singleton
import "./template.css";

/**
 * Quill editor pre-wired for template authoring:
 *  - type `{{` to insert a variable chip
 *  - "Section" button inserts a config-driven label:value grid (click it to edit)
 *  - "Divider" button inserts a horizontal rule
 *  - "Layout" button inserts a boxed grid (click a cell to edit / split / merge)
 *
 * @param {Object} props
 * @param {Object|Array} props.variables - flat map {key:value} or [{id,label}]
 * @param {string} props.value           - current template HTML
 * @param {Function} props.onChange      - (html) => void
 * @param {boolean} [props.disabled]
 * @param {string} [props.height]
 */
export default function TemplateEditor({
  variables,
  value,
  onChange,
  disabled,
  height = "300px",
}) {
  const variableList = toVariableList(variables);
  const onSearchMention = createMentionSource(variableList);
  const editorRef = useRef(null);

  const getQuill = () => editorRef.current && editorRef.current.getQuill();

  const insertDivider = () => {
    const quill = getQuill();
    if (!quill) return;
    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, "divider", true, "user");
    quill.setSelection(range.index + 1, 0, "silent");
  };

  const insertSection = () => {
    const quill = getQuill();
    if (!quill) return;
    const range = quill.getSelection(true);
    const starter = variableList.slice(0, 4).map((v) => ({
      label: v.value,
      value: v.id,
    }));
    const config = {
      columns: 2,
      dividerTop: true,
      dividerBetween: false,
      rows: starter.length ? starter : [{ label: "Label", value: "" }],
    };
    quill.insertEmbed(range.index, "section", config, "user");
    quill.setSelection(range.index + 1, 0, "silent");
  };

  const insertLayout = () => {
    const quill = getQuill();
    if (!quill) return;
    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, "layout", defaultCell(), "user");
    quill.setSelection(range.index + 1, 0, "silent");
  };

  // Click a section to edit its config.
  useEffect(() => {
    let root = null;
    let handler = null;
    const id = setInterval(() => {
      const quill = getQuill();
      if (!quill) return;
      clearInterval(id);
      root = quill.root;
      handler = (e) => {
        // Layout cell: open the cell editor for the clicked cell.
        const layoutNode = e.target.closest(".tpl-layout");
        if (layoutNode) {
          const cellNode = e.target.closest("td[data-path]");
          if (!cellNode) return;
          let tree = null;
          try {
            tree = JSON.parse(layoutNode.getAttribute("data-config"));
          } catch (err) {
            tree = null;
          }
          if (!tree) return;
          const path = parsePath(cellNode.getAttribute("data-path"));
          openLayoutCellEditor(tree, path, variableList, (newTree) => {
            const blot = Quill.find(layoutNode);
            if (!blot) return;
            const index = quill.getIndex(blot);
            quill.deleteText(index, 1, "user");
            quill.insertEmbed(index, "layout", newTree, "user");
          });
          return;
        }

        const node = e.target.closest(".tpl-section");
        if (!node) return;
        let config = null;
        try {
          config = JSON.parse(node.getAttribute("data-config"));
        } catch (err) {
          config = null;
        }
        if (!config) return;
        openSectionEditor(config, variableList, (newConfig) => {
          const blot = Quill.find(node);
          if (!blot) return;
          const index = quill.getIndex(blot);
          quill.deleteText(index, 1, "user");
          quill.insertEmbed(index, "section", newConfig, "user");
        });
      };
      root.addEventListener("click", handler);
    }, 100);
    return () => {
      clearInterval(id);
      if (root && handler) root.removeEventListener("click", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(variableList)]);

  return (
    <div>
      <div className="tpl-insert-bar">
        <button type="button" onClick={insertSection}>
          ▦ Section
        </button>
        <button type="button" onClick={insertDivider}>
          ― Divider
        </button>
        <button type="button" onClick={insertLayout}>
          ▣ Layout
        </button>
      </div>
      <RichTextEditorWrapper
        ref={editorRef}
        value={value}
        onChange={onChange}
        disabled={disabled}
        height={height}
        allowMention
        mentionChars={["{{"]}
        showDenotationChar={false}
        onSearchMention={onSearchMention}
        renderMentionItem={(item) => item.value}
      />
    </div>
  );
}
