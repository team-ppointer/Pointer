import { mergeAttributes, Node } from '@tiptap/react';
import { ReactNodeViewRenderer } from '@tiptap/react';
import type { NodeType } from '@tiptap/pm/model';
import { ImageOCRNode as ImageOCRNodeComponent } from './image-ocr-node';

export type UploadFunction = (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
) => Promise<string>;

export interface ImageOCROptions {
  /**
   * Destination node type when replacing OCR result. Not used directly here,
   * but kept for parity with image upload.
   * @default 'paragraph'
   */
  type?: string | NodeType | undefined;
  /**
   * Acceptable file types for upload.
   * @default 'image/*'
   */
  accept?: string;
  /**
   * Maximum number of files that can be uploaded.
   * @default 1
   */
  limit?: number;
  /**
   * Maximum file size in bytes (0 for unlimited).
   * @default 0
   */
  maxSize?: number;
  /**
   * Function to handle the upload process, should return a public URL.
   */
  upload?: UploadFunction;
  /**
   * Callback for upload/OCR errors.
   */
  onError?: (error: Error) => void;
  /**
   * Optional callback when OCR successfully completes with text.
   */
  onSuccess?: (text: string) => void;
  /**
   * Placeholder for server-side OCR mutation. Leave as a no-op for now.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ocrApiCall?: (data: any) => Promise<any>;
  /**
   * HTML attributes to add to the outer element.
   * @default {}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    imageOCR: {
      setImageOCRNode: (options?: ImageOCROptions) => ReturnType;
    };
  }
}

export const ImageOCRNode = Node.create<ImageOCROptions>({
  name: 'imageOCR',

  group: 'block',

  draggable: true,

  atom: true,

  addOptions() {
    return {
      type: 'paragraph',
      accept: 'image/*',
      limit: 1,
      maxSize: 0,
      upload: undefined,
      onError: undefined,
      onSuccess: undefined,
      ocrApiCall: async () => ({}) as unknown as (data: any) => Promise<any>, // eslint-disable-line @typescript-eslint/no-explicit-any
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      accept: {
        default: this.options.accept,
      },
      limit: {
        default: this.options.limit,
      },
      maxSize: {
        default: this.options.maxSize,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-ocr"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'image-ocr' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageOCRNodeComponent);
  },

  addCommands() {
    return {
      setImageOCRNode:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { selection } = editor.state;
        const { nodeAfter } = selection.$from;

        if (nodeAfter && nodeAfter.type.name === 'imageOCR' && editor.isActive('imageOCR')) {
          const nodeEl = editor.view.nodeDOM(selection.$from.pos);
          if (nodeEl && nodeEl instanceof HTMLElement) {
            const firstChild = nodeEl.firstChild;
            if (firstChild && firstChild instanceof HTMLElement) {
              firstChild.click();
              return true;
            }
          }
        }
        return false;
      },
    };
  },
});

export default ImageOCRNode;
