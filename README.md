# Editor Hub

Editor Hub is a powerful and customizable rich text editor component for React applications. It combines the functionality of Quill.js with additional features like emoji support, mentions, and better table handling.

![image](https://github.com/user-attachments/assets/affa5da3-39c6-4cd3-844e-798985077655)


## Features

- Rich text editing with Quill.js
- Emoji picker and inline emoji support
- @mentions functionality
- Enhanced table editing
- Customizable toolbar
- Resizable images

## Overview

Editor Hub was created as a wrapper over Quill v2.0 and react-quill, with built-in support for emojis and other advanced features. This integration eliminates common errors users face when including these features separately, allowing developers to use advanced functionality directly without worrying about compatibility issues.

We envision Editor Hub as a highly capable and user-friendly rich text editor with the potential for diverse applications, including the creation of email templates. Our goal is to provide a seamless editing experience while offering powerful features out of the box.

## Installation and Setup for Development

To use Editor Hub in your project during development, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/editor-hub.git
   cd editor-hub
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Build the project:

   ```bash
   yarn build
   ```

   Facing some error regarding ssl legacy/digital envelope routine: try `export NODE_OPTIONS=--openssl-legacy-provider` and then rebuild.

4. Link the package locally:

   ```bash
   yarn link
   ```

5. In your project directory, link to the local Editor Hub:

   ```bash
   cd /path/to/your/project
   yarn link "editor-hub"
   ```

6. You can now import and use Editor Hub in your project:
   ```jsx
   import RichTextEditorWrapper from "editor-hub";
   ```

### Watch for File Changes

To automatically rebuild the project on file changes, use the `watch` command:

```bash
yarn watch
```

This will watch for changes in the source files and automatically rebuild the project, which improves the development workflow by eliminating the need for manual rebuilds.

## Usage

Here's a basic example of how to use the Editor Hub component:

```jsx
import React from "react";
import RichTextEditorWrapper from "editor-hub";
const MyEditor = () => {
  const handleChange = (content) => {
    console.log("Editor content:", content);
  };
  return (
    <RichTextEditorWrapper
      value=""
      onChange={handleChange}
      placeholder="Start typing..."
    />
  );
};
export default MyEditor;
```

## API

The `RichTextEditorWrapper` component accepts the following props:

- `theme` (string): The theme to use for the Quill editor. Default is `"snow"`. Other options include `"bubble"`. (Bubble is a simple tooltip based theme.)
- `disabled`: Boolean to disable the editor
- `value`: Initial value of the editor
- `onChange`: Callback function when content changes
- `height`: Height of the editor (default: "auto")
- `disableToolbar`: Boolean to disable the toolbar
- `toolbarOptions`: Custom toolbar options
- `allowMention`: Boolean to enable mentions
- `onMentionSelect`: Callback function when a mention is selected
- `renderMentionItem`: Custom render function for mention items
- `onSearchMention`: Function to handle mention search
- `onSubmit`: Callback function when the editor content is submitted
- `mentionChars`: Array of characters that trigger mentions (default: ["@"])
- `showDenotationChar`: Boolean to show the denotation character in mentions

## Customization

### Toolbar Options

You can customize the toolbar by passing a `toolbarOptions` prop. Here's an example:

```javascript
const toolbarOptions = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }],
  [{ size: ["small", false, "large", "huge"] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ["clean"],
  ["link", "image", "video"],
];
```

### Mention Configuration

To enable and configure mentions, use the following props:

- `allowMention`: Set to `true` to enable mentions
- `onMentionSelect`: Callback function when a mention is selected
- `renderMentionItem`: Custom render function for mention items
- `onSearchMention`: Function to handle mention search
- `mentionChars`: Array of characters that trigger mentions
- `showDenotationChar`: Whether to show the @ symbol in mentions

## Unlinking

When you're finished developing or testing with the linked package, you can unlink it:

1. In your project directory:

   ```bash
   yarn unlink editor-hub
   ```

2. In the editor-hub directory:
   ```bash
   yarn unlink
   ```

This will remove the symlinks created by `yarn link`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Future Development

As we continue to develop Editor Hub, we aim to enhance its capabilities and expand its use cases. Some areas of focus include:

- Enhanced customization options
- Additional plugins and integrations
- Improved email template creation and editing
- Performance optimizations

We welcome contributions and feedback from the community to help shape the future of Editor Hub.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Quill.js](https://quilljs.com/)
- [quill-better-table](https://github.com/soccerloway/quill-better-table)
- [quill-mention](https://github.com/afry/quill-mention)
- [quill-emoji](https://github.com/contentco/quill-emoji)

## Template fields (v1)

Editor Hub can act as a lightweight PandaDoc-style template editor. Pass `mode="author"` to place fields (via the `insertField` ref method) into the document, or `mode="fill"` to let end users type values into those fields without touching the surrounding document structure. Use `getTemplate()` to get the blank (value-cleared) template HTML for saving, `getValues()` to read back `{ values, missingRequired }` keyed by field id, and `getRenderedHTML()` to get the final HTML with fields replaced by their plain, escaped values. Unknown or legacy field types found in loaded HTML are rendered as inert, disabled chips instead of crashing or becoming editable.

```jsx
const editorRef = useRef(null);

<RichTextEditorWrapper ref={editorRef} mode="author" value={value} />;

editorRef.current.insertField({ type: "text", label: "Shipper Name", required: true });
const template = editorRef.current.getTemplate();
const { values, missingRequired } = editorRef.current.getValues();
const rendered = editorRef.current.getRenderedHTML();
```

**Caveat:** typing into a field while in `mode="fill"` updates the field's own dataset but does **not** fire `onChange` (the underlying Quill Delta for the surrounding document is unchanged). If you drive the `value` prop from your own state, call `getValues()` and/or `getRenderedHTML()` to capture what the user typed *before* changing `value` — otherwise the re-render can discard the typed field values. Also note that the `disabled` prop now reacts to changes at runtime (it previously only took effect on mount).

## Support

If you have any questions or need help with Editor Hub, please open an issue in the GitHub repository.

---
