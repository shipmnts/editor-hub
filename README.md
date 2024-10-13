# Editor Hub

Editor Hub is a powerful and customizable rich text editor component for React applications. It combines the functionality of Quill.js with additional features like emoji support, mentions, and better table handling.

## Features

- Rich text editing with Quill.js
- Emoji picker and inline emoji support
- @mentions functionality
- Enhanced table editing
- Customizable toolbar
- Resizable images

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

4. Link the package locally:

   ```bash
   yarn link
   ```

5. In your project directory, link to the local Editor Hub:

   ```bash
   cd /path/to/your/project
   yarn link editor-hub
   ```

6. You can now import and use Editor Hub in your project:
   ```jsx
   import RichTextEditorWrapper from "editor-hub";
   ```

Remember to rebuild Editor Hub (`yarn build` in the editor-hub directory) when you make changes to it.

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

This will remove the symlinks created by yarn link.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Quill.js](https://quilljs.com/)
- [quill-better-table](https://github.com/soccerloway/quill-better-table)
- [quill-mention](https://github.com/afry/quill-mention)
- [quill-emoji](https://github.com/contentco/quill-emoji)

## Support

If you have any questions or need help with Editor Hub, please open an issue in the GitHub repository.
