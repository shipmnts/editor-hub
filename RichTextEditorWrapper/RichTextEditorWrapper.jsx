import React, { useEffect, useRef } from "react";
import { useQuill } from "../react-quilljs-main";
import QuillBetterTable from "../quill-better-table-master/src/quill-better-table";
import * as Emoji from "../quill-emojijs-main/src/quill-emoji";
// import "@devdcodes9/quill-emojijs/dist/quill-emoji.css;
import mention from "../quill-mention/src/quill.mention";
import ResizeModule from "@ssumo/quill-resize-module";
import "./richtext.css";
// interface RichTextEditorWrapperProp {
//   disabled?: boolean;
//   value?: string;
//   onChange?: (content: string) => void;
//   height?: string;
//   disableToolbar?: boolean;
//   toolbarOptions?: any;
//   allowMention?: boolean;
//   onMentionSelect?: (item: any, insertItem: any) => void;
//   renderMentionItem?: (item: any, searchTerm: any) => void;
//   onSearchMention?: (
//     searchTerm: any,
//     renderList: any,
//     mentionChar: any
//   ) => void;
//   onSubmit?: (content: any) => void;
//   mentionChars?: string[];
//   showDenotationChar?: boolean;
// }

const RichTextEditorWrapper = (props) => {
  const {
    disabled,
    value,
    onChange,
    height = "auto",
    disableToolbar,
    disableImagePaste = false,
    toolbarOptions,
    allowMention,
    onMentionSelect,
    renderMentionItem,
    onSearchMention,
    onSubmit,
    mentionChars = ["@"],
    showDenotationChar = true,
    theme = "snow",
  } = props;

  const { quill, quillRef, Quill } = useQuill({
    modules: {
      table: false,
      "better-table": {
        operationMenu: {
          items: {
            unmergeCells: {
              text: "Another unmerge cells name",
            },
          },
        },
      },
      resize: {
        locale: {
          altTip: "Enter key OK",
          inputTip: "Enter key to confirm",
          floatLeft: "left",
          floatRight: "right",
          center: "center",
          restore: "restore",
        },
      },
      mention: allowMention && {
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: mentionChars,
        onSelect: onMentionSelect,
        renderItem: renderMentionItem,
        source: onSearchMention,
        showDenotationChar: showDenotationChar,
      },
      toolbar: disableToolbar
        ? false
        : toolbarOptions || {
            container: [
              ["bold", "italic", "underline", "strike", "blockquote"],
              [{ header: 1 }, { header: 2 }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ script: "sub" }, { script: "super" }],
              [{ indent: "-1" }, { indent: "+1" }],
              [{ color: [] }, { background: [] }],
              [{ font: [] }],
              [{ align: [] }],
              ["link", "image", "video"],
              ["clean"],
              ["emoji"],
              // ['table'],
            ],
          },

      "emoji-toolbar": true,
      "emoji-textarea": false,
      "emoji-shortname": true,
    },
    theme: (["snow", "bubble"]).some((value) => value === theme) ? theme : "snow",
  });
  if (Quill && !quill) {
    try {
      Quill.register("modules/better-table", QuillBetterTable);
      Quill.register("modules/resize", ResizeModule);
      Quill.register("modules/emoji", Emoji.default, true);
      Quill.register("formats/emoji", Emoji.default.EmojiBlot, true);
      Quill.register("modules/emoji-toolbar", Emoji.default.ToolbarEmoji, true);
      Quill.register(
        "modules/emoji-textarea",
        Emoji.default.TextAreaEmoji,
        true
      );
      Quill.register(
        "modules/emoji-shortname",
        Emoji.default.ShortNameEmoji,
        true
      );
      const BackgroundStyle = Quill.import("attributors/style/background");
      const ColorStyle = Quill.import("attributors/style/color");
      const FontStyle = Quill.import("attributors/style/font");
      const AlignStyle = Quill.import("attributors/style/align");
      const DirectionStyle = Quill.import("attributors/style/direction");
      Quill.register("modules/mention", mention.Mention);
      Quill.register("blots/mention", mention.MentionBlot);
      Quill.register(BackgroundStyle, true);
      Quill.register(ColorStyle, true);
      Quill.register(FontStyle, true);
      Quill.register(AlignStyle, true);
      Quill.register(DirectionStyle, true);
    } catch (e) {
      console.log("Error: ", e);
    }
  }

  // const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (quill) {
      if (disableImagePaste) {
        quill.clipboard.addMatcher(["IMG", "PICTURE", "PNG"], (node, delta) => {
          const Delta = Quill.import("delta");
          return new Delta().insert("");
        });
      }
      quill.on("text-change", (delta, oldDelta, source) => {
        const sanitizedData = quill.root.innerHTML.replace(/<img[^>]*>/gi, "");
        const data = disableImagePaste ? sanitizedData : quill.root.innerHTML;
        if (onChange) onChange(data);
      });
      quill.enable(!disabled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quill, quillRef]);

  useEffect(() => {
    if (!value) {
      quill?.setText("");
    }
    if (quill && value && quill?.root.innerHTML !== value) {
      const sanitizedData = value.replace(/<img[^>]*>/gi, "");
      const data = disableImagePaste ? sanitizedData : value;
      quill.setContents(quill.clipboard.convert({ html: `${data}` }));
    }
  }, [value, quill]);

  const keyboardBindingHandler = (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      handleCtrlEnter();
    } else if (e.key === "Enter" && allowMention) {
      // 13 is the key for enter in keyboard module bindings
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const bindings = quill?.keyboard?.bindings;
      const handler = bindings["13"][0].handler;
      handler();
    }
  };

  const handleCtrlEnter = () => {
    const quillContent = quill?.getContents();
    if (quillContent && onSubmit) {
      onSubmit(quillContent);
    }
  };

  return (
    <div>
      <div
        style={{ height: height }}
        ref={quillRef}
        onKeyDown={(e) => {
          keyboardBindingHandler(e);
        }}
      />
    </div>
  );
};

export default RichTextEditorWrapper;
