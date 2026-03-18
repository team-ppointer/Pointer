'use client';

import * as React from 'react';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';

// --- Tiptap Core Extensions ---
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Highlight } from '@tiptap/extension-highlight';
import { InlineMath, createMathMigrateTransaction } from '@tiptap/extension-mathematics';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Selection } from '@tiptap/extensions';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import { cn } from './utils/tiptap-utils';

// --- Tiptap Node ---
// import { ImageUploadNode } from '../../tiptap-node/image-upload-node/image-upload-node-extension';
// import { ImageOCRNode } from '../../tiptap-node/image-ocr-node/image-ocr-node-extension';
import { HorizontalRule } from './nodes/horizontal-rule-node/horizontal-rule-node-extension';
import './nodes/blockquote-node/blockquote-node.scss';
import './nodes/code-block-node/code-block-node.scss';
import './nodes/horizontal-rule-node/horizontal-rule-node.scss';
import './nodes/list-node/list-node.scss';
import './nodes/image-node/image-node.scss';
import './nodes/heading-node/heading-node.scss';
import './nodes/paragraph-node/paragraph-node.scss';
import './nodes/mathematics-node/mathematics-node.scss';

// --- Lib ---
// import { handleImageUpload, MAX_FILE_SIZE } from '../../utils';

// --- Styles ---
import './pointer-viewer.scss';
import 'katex/dist/katex.min.css';

type PointerViewerProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  variant?: 'default' | 'problem';
  contentPadding?: number | string;
};

export function PointerViewer({
  content,
  variant = 'default',
  contentPadding,
}: PointerViewerProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': '내용이 없습니다.',
        class: 'simple-editor',
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      InlineMath.configure({
        katexOptions: {
          throwOnError: false,
          displayMode: true,
        },
      }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      // ImageUploadNode.configure({
      //   accept: 'image/*',
      //   maxSize: MAX_FILE_SIZE,
      //   limit: 1,
      //   upload: handleImageUpload,
      //   onError: (error) => console.error('Upload failed:', error),
      // }),
      // ImageOCRNode.configure({
      //   accept: 'image/*',
      //   maxSize: MAX_FILE_SIZE,
      //   limit: 1,
      //   upload: handleImageUpload,
      //   onError: (error) => console.error('OCR failed:', error),
      //   onSuccess: () => {},
      // }),
      Table,
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
  });

  // When `content` prop changes, push it into the TipTap instance and migrate math nodes.
  React.useEffect(() => {
    if (!editor) return;

    // If content is empty/null, clear the document.
    if (content === null) {
      editor.commands.clearContent(true);
      return;
    }

    // Avoid unnecessary updates when content is JSON and hasn't changed.
    try {
      if (typeof content !== 'string') {
        const current = editor.getJSON();
        const same = JSON.stringify(current) === JSON.stringify(content);
        if (same) {
          // Even if content is same, ensure math migration is applied once.
          const trSame = createMathMigrateTransaction(editor, editor.state.tr);
          if (trSame && trSame.steps.length > 0) editor.view.dispatch(trSame);
          return;
        }
      }
    } catch {
      // ignore comparison errors and proceed to set content
    }

    // Set new content (supports both ProseMirror JSON and HTML string)
    editor.commands.setContent(content, { errorOnInvalidContent: false });

    // Run math migration after setting content
    const tr = createMathMigrateTransaction(editor, editor.state.tr);
    if (tr && tr.steps.length > 0) {
      editor.view.dispatch(tr);
    }
  }, [content, editor]);

  const viewerPaddingValue =
    contentPadding === undefined
      ? '0'
      : typeof contentPadding === 'number'
        ? `${contentPadding}px`
        : contentPadding || '0';

  const editorContentClassName = cn(
    'simple-editor-content',
    variant === 'problem' && 'simple-editor-content--problem'
  );

  const editorContentStyle =
    variant === 'problem'
      ? ({
          '--simple-editor-viewer-padding': viewerPaddingValue,
        } as React.CSSProperties)
      : undefined;

  return (
    <div className='simple-editor-wrapper'>
      <div className='simple-editor-scroll-area'>
        <EditorContext.Provider value={{ editor }}>
          <EditorContent
            editor={editor}
            role='presentation'
            className={editorContentClassName}
            style={editorContentStyle}
          />
        </EditorContext.Provider>
      </div>
    </div>
  );
}
