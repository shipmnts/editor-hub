import { RefObject } from "react";
import Quill, { QuillOptionsStatic } from "quill";
/**
 *
 * @param options Quill static options. https://github.com/gtgalone/react-quilljs#options
 * @returns Returns quill, quillRef, and Quill. https://github.com/gtgalone/react-quilljs#return
 */
export declare const useQuill: (options?: QuillOptionsStatic | undefined) => {
    Quill: any;
    quillRef: RefObject<any>;
    quill: Quill | undefined;
    editorRef: RefObject<any>;
    editor: Quill | undefined;
};
