import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface ImagePasteUploadOptions {
  upload: (
    file: File,
    onProgress?: (event: { progress: number }) => void,
    abortSignal?: AbortSignal
  ) => Promise<string>;
}

/**
 * Tiptap extension that intercepts clipboard paste events containing images,
 * uploads them via the provided upload function, and inserts standard image nodes.
 */
export const ImagePasteUpload = Extension.create<ImagePasteUploadOptions>({
  name: 'imagePasteUpload',

  addOptions() {
    return {
      upload: undefined as unknown as ImagePasteUploadOptions['upload'],
    };
  },

  addProseMirrorPlugins() {
    const upload = this.options.upload;

    return [
      new Plugin({
        key: new PluginKey('imagePasteUpload'),
        props: {
          handlePaste(view, event) {
            if (!upload) return false;

            const files = Array.from(event.clipboardData?.files ?? []);
            const images = files.filter((f) => f.type.startsWith('image/'));
            if (images.length === 0) return false;

            event.preventDefault();

            for (const file of images) {
              const pos = view.state.selection.from;
              upload(file)
                .then((url) => {
                  const imageNode = view.state.schema.nodes.image;
                  if (!imageNode) return;
                  const node = imageNode.create({ src: url });
                  const tr = view.state.tr.insert(pos, node);
                  view.dispatch(tr);
                })
                .catch((err) => {
                  console.error('Paste image upload failed:', err);
                });
            }

            return true;
          },
        },
      }),
    ];
  },
});
