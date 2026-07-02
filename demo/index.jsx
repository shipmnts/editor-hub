import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import RichTextEditorWrapper from "../index.js";

function Demo() {
  const editorRef = useRef(null);
  const [mode, setMode] = useState("author");
  const [output, setOutput] = useState("");

  const show = (label, data) =>
    setOutput(`${label}:\n${typeof data === "string" ? data : JSON.stringify(data, null, 2)}`);

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Template fields demo — mode: {mode}</h2>
      <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setMode(mode === "author" ? "fill" : "author")}>
          Switch to {mode === "author" ? "fill" : "author"} mode
        </button>
        <button
          disabled={mode !== "author"}
          onClick={() =>
            editorRef.current?.insertField({
              type: "text",
              label: "Shipper Name",
              required: true,
            })
          }
        >
          + Text field
        </button>
        <button onClick={() => show("Template HTML", editorRef.current?.getTemplate())}>
          Get template
        </button>
        <button onClick={() => show("Values JSON", editorRef.current?.getValues())}>
          Get values
        </button>
        <button onClick={() => show("Rendered HTML", editorRef.current?.getRenderedHTML())}>
          Get rendered HTML
        </button>
      </div>
      <RichTextEditorWrapper ref={editorRef} mode={mode} height="300px" />
      <pre
        style={{ background: "#f5f5f5", padding: 12, whiteSpace: "pre-wrap", marginTop: 12 }}
      >
        {output}
      </pre>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Demo />);
