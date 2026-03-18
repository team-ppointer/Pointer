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

// --- UI Primitives ---
import { Button, Spacer, Toolbar, ToolbarGroup, ToolbarSeparator } from './ui';

// --- Tiptap Node ---
import { ImageUploadNode } from './nodes/image-upload-node/image-upload-node-extension';
import { ImageOCRNode } from './nodes/image-ocr-node/image-ocr-node-extension';
import { HorizontalRule } from './nodes/horizontal-rule-node/horizontal-rule-node-extension';
import './nodes/blockquote-node/blockquote-node.scss';
import './nodes/code-block-node/code-block-node.scss';
import './nodes/horizontal-rule-node/horizontal-rule-node.scss';
import './nodes/list-node/list-node.scss';
import './nodes/image-node/image-node.scss';
import './nodes/heading-node/heading-node.scss';
import './nodes/paragraph-node/paragraph-node.scss';
import './nodes/mathematics-node/mathematics-node.scss';
import './nodes/answer-block-node/answer-block-node.scss';

// --- Tiptap UI ---
import {
  ImageUploadButton,
  ImageOCRButton,
  ListDropdownMenu,
  BlockquoteButton,
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  MarkButton,
  UndoRedoButton,
  MathematicsButton,
  AnswerBoxDropdownMenu,
  MathInlinePopover,
} from './ui';

// --- Icons ---
import { ArrowLeftIcon, HighlighterIcon, LinkIcon } from './assets';

// --- Hooks ---
import { useIsMobile, useWindowSize, useCursorVisibility } from './hooks';

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE, extractPayload, type TiptapPayload } from './utils';

// --- Styles ---
import './pointer-editor.scss';
import 'katex/dist/katex.min.css';

// import content from '../../../components/tiptap-templates/simple/data/content.json';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { debounce } from 'lodash';

const MainToolbarContent = ({
  ocrApiCall,
  mathInstanceId,
}: {
  ocrApiCall?: ((data: any) => Promise<any>) | null; // eslint-disable-line @typescript-eslint/no-explicit-any
  mathInstanceId: string;
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action='undo' />
        <UndoRedoButton action='redo' />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        {/* <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} /> */}
        <ListDropdownMenu types={['bulletList', 'orderedList', 'hangulList']} portal />
        <BlockquoteButton />
        {/* <CodeBlockButton /> */}
        <AnswerBoxDropdownMenu columnCounts={[1, 3, 5]} portal />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type='bold' />
        <MarkButton type='italic' />
        <MarkButton type='strike' />
        {/* <MarkButton type='code' /> */}
        <MarkButton type='underline' />
        <ColorHighlightPopover />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MathematicsButton mathInstanceId={mathInstanceId} />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton />
        {ocrApiCall && <ImageOCRButton />}
      </ToolbarGroup>

      <Spacer />
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: 'highlighter' | 'link';
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button data-style='ghost' onClick={onBack}>
        <ArrowLeftIcon className='tiptap-button-icon' />
        {type === 'highlighter' ? (
          <HighlighterIcon className='tiptap-button-icon' />
        ) : (
          <LinkIcon className='tiptap-button-icon' />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === 'highlighter' ? <ColorHighlightPopoverContent /> : <></>}
  </>
);

export function PointerEditor({
  initialJSON,
  onChange,
  useContainerPortal = true,
  ocrApiCall = null,
}: {
  initialJSON?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  onChange: (payload: TiptapPayload) => void;
  /** Whether to portal popups to the editor container instead of document.body */
  useContainerPortal?: boolean;
  ocrApiCall?: ((data: any) => Promise<any>) | null; // eslint-disable-line @typescript-eslint/no-explicit-any
}) {
  const isMobile = useIsMobile();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = React.useState<'main' | 'highlighter' | 'link'>('main');
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const editorWrapperRef = React.useRef<HTMLDivElement>(null);
  const mathInstanceId = React.useId();
  const [mathState, setMathState] = React.useState<{
    mode: 'edit' | 'create';
    open: boolean;
    latex: string;
    pos: number | null;
    anchorRect: DOMRect | null;
  }>({
    mode: 'edit',
    open: false,
    latex: '',
    pos: null,
    anchorRect: null,
  });
  const previewInsertedRef = React.useRef(false);
  const previewPosRef = React.useRef<number | null>(null);
  const originalLatexRef = React.useRef('');

  const editor = useEditor(
    {
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      editorProps: {
        attributes: {
          autocomplete: 'off',
          autocorrect: 'off',
          autocapitalize: 'off',
          'aria-label': '여기에 입력하세요...',
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
          onClick: (node: ProseMirrorNode, pos: number) => {
            const latex = (node.attrs as { latex?: string }).latex ?? '';
            originalLatexRef.current = latex;
            previewInsertedRef.current = false;
            previewPosRef.current = null;
            setMathState({ mode: 'edit', open: true, latex, pos, anchorRect: null });
          },
        }),
        Image,
        Typography,
        Superscript,
        Subscript,
        Selection,
        ImageUploadNode.configure({
          accept: 'image/*',
          maxSize: MAX_FILE_SIZE,
          limit: 1,
          upload: handleImageUpload,
          onError: (error) => console.error('Upload failed:', error),
        }),
        ImageOCRNode.configure({
          accept: 'image/*',
          maxSize: MAX_FILE_SIZE,
          limit: 1,
          upload: handleImageUpload,
          onError: (error) => console.error('OCR failed:', error),
          onSuccess: () => {},
          ocrApiCall: ocrApiCall!,
        }),
        Table,
        TableRow,
        TableHeader,
        TableCell,
      ],
      content:
        initialJSON ??
        `
      <!--h1>
        This editor supports <span data-type="inline-math" data-latex="\\LaTeX"></span> math expressions. And it even supports converting old $\\sub(3*5=15)$ calculations.
      </h1>
      <p>This is a old $\\LaTeX$ calculation string with $3*5=15$ calculations.</p>
      <p>
        Did you know that <span data-type="inline-math" data-latex="3 * 3 = 9"></span>? Isn't that crazy? Also Pythagoras' theorem is <span data-type="inline-math" data-latex="a^2 + b^2 = c^2"></span>.<br />
        Also the square root of 2 is <span data-type="inline-math" data-latex="\\sqrt{2}"></span>. If you want to know more about <span data-type="inline-math" data-latex="\\LaTeX"></span> visit <a href="https://katex.org/docs/supported.html" target="_blank">katex.org</a>.
      </p>
      <code>
        <pre>$\\LaTeX$</pre>
      </code>
      <p>
        Do you want go deeper? Here is a list of all supported functions:
      </p>
      <ul>
        <li><span data-type="inline-math" data-latex="\\sin(x)"></span></li>
        <li><span data-type="inline-math" data-latex="\\cos(x)"></span></li>
        <li><span data-type="inline-math" data-latex="\\tan(x)"></span></li>
        <li><span data-type="inline-math" data-latex="\\log(x)"></span></li>
        <li><span data-type="inline-math" data-latex="\\ln(x)"></span></li>
        <li><span data-type="inline-math" data-latex="\\sqrt{x}"></span></li>
        <li><span data-type="inline-math" data-latex="\\sum_{i=0}^n x_i"></span></li>
        <li><span data-type="inline-math" data-latex="\\int_a^b x^2 dx"></span></li>
        <li><span data-type="inline-math" data-latex="\\frac{1}{x}"></span></li>
        <li><span data-type="inline-math" data-latex="\\binom{n}{k}"></span></li>
        <li><span data-type="inline-math" data-latex="\\sqrt[n]{x}"></span></li>
        <li><span data-type="inline-math" data-latex="\\left(\\frac{1}{x}\\right)"></span></li>
        <li><span data-type="inline-math" data-latex="\\left\\{\\begin{matrix}x&\\text{if }x>0\\\\0&\\text{otherwise}\\end{matrix}\\right."></span></li>
      </ul-->
      <p>$0 < a < \\frac{4}{7}$ 인 실수 $a$ 와 유리수 $b$ 에 대하여 닫힌구간 $\\left[-\\frac{\\pi}{a}, \\frac{2 \\pi}{a}\\right]$ 에서 정의된 함수 $f(x)=2 \\sin (a x)+b$ 가 있다.</p>
      <p>함수 $y=f(x)$ 의 그래프가 두 점 $\\left(-\\frac{\\pi}{2}, 0\\right), \\left(\\frac{7}{2} \\pi, 0\\right)$ 을 지날 때, $30(a+b)$ 의 값을 구하시오.</p>
      <hr />
      <p>$a>1$ 인 실수 $a$ 에 대하여 곡선 $y=\\log _{a} x$ 와 원 $C:\\left(x-\\frac{5}{4}\\right)^{2}+y^{2}=\\frac{13}{16}$ 의 두 교점을 $\\mathrm{P}, \\mathrm{Q}$ 라 하자.</p>
      <p>선분 $\\overline{PQ}$ 가 원 $C$ 의 지름일 때, $a$ 의 값은?</p>
      <hr />
      <p>상수 $a(a \\neq 3 \\sqrt{5})$ 와 최고차항의 계수가 음수인 이차함수 $f(x)$ 에 대하여</p>
      <p>함수 $g(x)=\\left\\{\\begin{array}{ll} x^{3}+a x^{2}+15 x+7 & (x \\leq 0) \\\\ f(x) & (x>0) \\end{array}\\right.$</p>
      <p>이 다음 조건을 만족시킨다.</p>
      <blockquote>
        <p>(가) 함수 $g(x)$ 는 실수 전체의 집합에서 미분가능하다.</p>
        <p>(나) $x$ 에 대한 방정식 $g^{\\prime}(x) \\times g^{\\prime}(x-4)=0$ 의 서로 다른 실근의 개수는 4 이다.</p>
      </blockquote>
      <p>$g(-2)+g(2)$ 의 값은?</p>
      <table>
        <tr>
          <td>30</td>
          <td>32</td>
          <td>34</td>
          <td>36</td>
          <td>38</td>
        </tr>
      </table>
      
    `,
    },
    [ocrApiCall]
  );

  if (editor) {
    const tr = createMathMigrateTransaction(editor, editor.state.tr);
    editor.view.dispatch(tr);
  }

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  React.useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main');
    }
  }, [isMobile, mobileView]);

  React.useEffect(() => {
    if (!editor || !onChange) return;

    const handler = debounce(() => {
      onChange(extractPayload(editor));
    }, 300);

    editor.on('update', handler);
    onChange(extractPayload(editor));

    return () => {
      editor.off('update', handler);
      handler.cancel();
    };
  }, [editor, onChange]);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<any>).detail; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!editor) return;
      if (detail?.editorId && detail.editorId !== mathInstanceId) return;
      const from = typeof detail?.pos === 'number' ? detail.pos : editor.state.selection.from;
      originalLatexRef.current = '';
      previewInsertedRef.current = false;
      previewPosRef.current = null;
      setMathState({
        mode: 'create',
        open: true,
        latex: typeof detail?.latex === 'string' ? detail.latex : '',
        pos: from,
        anchorRect: detail?.anchorRect ?? null,
      });
    };
    window.addEventListener('pointer-open-inline-math', handler as EventListener);
    return () => {
      window.removeEventListener('pointer-open-inline-math', handler as EventListener);
    };
  }, [editor, mathInstanceId]);

  return (
    <div className='simple-editor-wrapper' ref={editorWrapperRef}>
      <div className='simple-editor-scroll-area'>
        <EditorContext.Provider value={{ editor }}>
          <Toolbar
            ref={toolbarRef}
            style={{
              ...(isMobile
                ? {
                    bottom: `calc(100% - ${height - rect.y}px)`,
                  }
                : {}),
            }}>
            {mobileView === 'main' ? (
              <MainToolbarContent
                ocrApiCall={ocrApiCall}
                mathInstanceId={mathInstanceId}
              />
            ) : (
              <MobileToolbarContent
                type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
                onBack={() => setMobileView('main')}
              />
            )}
          </Toolbar>

          <MathInlinePopover
            editor={editor}
            open={mathState.open}
            latex={mathState.latex}
            pos={mathState.pos}
            variant='floating'
            minWidth='16rem'
            container={useContainerPortal ? editorWrapperRef.current : null}
            onPreview={(nextLatex) => {
              if (!editor) return;
              const trimmed = (nextLatex ?? '').trim();

              if (mathState.mode === 'create') {
                if (!previewInsertedRef.current) {
                  if (!trimmed) return;
                  const insertAt =
                    typeof mathState.pos === 'number' ? mathState.pos : editor.state.selection.from;
                  editor
                    .chain()
                    .setTextSelection(Math.max(0, insertAt))
                    .insertInlineMath({ latex: trimmed })
                    .run();
                  previewInsertedRef.current = true;
                  previewPosRef.current = insertAt;
                } else {
                  const pos = previewPosRef.current;
                  if (typeof pos !== 'number') return;
                  const nodeAtPos = editor.state.doc.nodeAt(pos);
                  if (!nodeAtPos || nodeAtPos.type.name !== 'inlineMath') return;

                  if (!trimmed) {
                    editor
                      .chain()
                      .deleteRange({ from: pos, to: pos + nodeAtPos.nodeSize })
                      .run();
                    previewInsertedRef.current = false;
                    previewPosRef.current = null;
                  } else {
                    editor
                      .chain()
                      .setNodeSelection(pos)
                      .updateAttributes('inlineMath', { latex: trimmed })
                      .run();
                  }
                }
              } else {
                const pos = mathState.pos;
                if (typeof pos !== 'number') return;
                const nodeAtPos = editor.state.doc.nodeAt(pos);
                if (!nodeAtPos || nodeAtPos.type.name !== 'inlineMath') return;
                editor
                  .chain()
                  .setNodeSelection(pos)
                  .updateAttributes('inlineMath', { latex: trimmed || originalLatexRef.current })
                  .run();
              }
            }}
            onOpenChange={(open) => {
              if (!open) {
                if (editor) {
                  if (previewInsertedRef.current && previewPosRef.current !== null) {
                    const pos = previewPosRef.current;
                    const nodeAtPos = editor.state.doc.nodeAt(pos);
                    if (nodeAtPos && nodeAtPos.type.name === 'inlineMath') {
                      editor
                        .chain()
                        .deleteRange({ from: pos, to: pos + nodeAtPos.nodeSize })
                        .focus()
                        .run();
                    }
                  } else if (mathState.mode === 'edit' && typeof mathState.pos === 'number') {
                    const nodeAtPos = editor.state.doc.nodeAt(mathState.pos);
                    if (nodeAtPos && nodeAtPos.type.name === 'inlineMath') {
                      editor
                        .chain()
                        .setNodeSelection(mathState.pos)
                        .updateAttributes('inlineMath', { latex: originalLatexRef.current })
                        .run();
                    }
                  }
                }
                previewInsertedRef.current = false;
                previewPosRef.current = null;
                setMathState((s) => ({ ...s, open: false }));
              }
            }}
            onSave={(nextLatex) => {
              const trimmed = (nextLatex ?? '').trim();
              const pos = mathState.pos;

              if (mathState.mode === 'create') {
                if (!trimmed) {
                  if (previewInsertedRef.current && previewPosRef.current !== null && editor) {
                    const pPos = previewPosRef.current;
                    const nodeAtPos = editor.state.doc.nodeAt(pPos);
                    if (nodeAtPos && nodeAtPos.type.name === 'inlineMath') {
                      editor.chain().deleteRange({ from: pPos, to: pPos + nodeAtPos.nodeSize }).focus().run();
                    }
                  }
                  previewInsertedRef.current = false;
                  previewPosRef.current = null;
                  setMathState({ mode: 'create', open: false, latex: '', pos: null, anchorRect: null });
                  return;
                }

                if (editor) {
                  if (previewInsertedRef.current && previewPosRef.current !== null) {
                    const pPos = previewPosRef.current;
                    const nodeAtPos = editor.state.doc.nodeAt(pPos);
                    if (nodeAtPos && nodeAtPos.type.name === 'inlineMath') {
                      editor
                        .chain()
                        .setNodeSelection(pPos)
                        .updateAttributes('inlineMath', { latex: trimmed })
                        .run();
                      editor
                        .chain()
                        .setTextSelection(pPos + nodeAtPos.nodeSize)
                        .focus()
                        .run();
                    }
                  } else {
                    const insertAt = typeof pos === 'number' ? pos : editor.state.selection.from;
                    editor
                      .chain()
                      .setTextSelection(Math.max(0, insertAt))
                      .focus()
                      .insertInlineMath({ latex: trimmed })
                      .run();
                    try {
                      const nodeAt = editor.state.doc.nodeAt(insertAt);
                      if (nodeAt) {
                        editor
                          .chain()
                          .setTextSelection(insertAt + nodeAt.nodeSize)
                          .focus()
                          .run();
                      }
                    } catch {
                      // best-effort
                    }
                  }
                }
                previewInsertedRef.current = false;
                previewPosRef.current = null;
                setMathState({ mode: 'create', open: false, latex: '', pos: null, anchorRect: null });
                return;
              }

              // EDIT mode (existing inlineMath)
              if (!trimmed) {
                // Delete the node if user cleared the content
                if (editor && typeof pos === 'number') {
                  const { state } = editor;
                  const nodeAtPos = state.doc.nodeAt(pos);
                  if (nodeAtPos && nodeAtPos.type.name === 'inlineMath') {
                    editor
                      .chain()
                      .focus()
                      .deleteRange({ from: pos, to: pos + nodeAtPos.nodeSize })
                      .run();
                  } else {
                    editor.chain().focus().deleteSelection().run();
                  }
                }
                setMathState({ mode: 'edit', open: false, latex: '', pos: null, anchorRect: null });
                return;
              }

              if (editor) {
                editor.chain().focus();

                const { state } = editor;
                const nodeAtPos = typeof pos === 'number' ? state.doc.nodeAt(pos) : null;

                if (nodeAtPos && nodeAtPos.type.name === 'inlineMath') {
                  const tried = editor
                    .chain()
                    .setNodeSelection(pos!)
                    .updateAttributes('inlineMath', { latex: trimmed })
                    .run();

                  if (!tried) {
                    editor
                      .chain()
                      .setTextSelection(Math.max(0, pos!))
                      .updateAttributes('inlineMath', { latex: trimmed })
                      .run();
                  }

                  // Move cursor to just after the inline math node
                  const updatedNode = editor.state.doc.nodeAt(pos!);
                  if (updatedNode && updatedNode.type.name === 'inlineMath') {
                    editor
                      .chain()
                      .setTextSelection(pos! + updatedNode.nodeSize)
                      .focus()
                      .run();
                  }
                } else {
                  // Fallback: update currently active inlineMath, if any
                  editor.chain().updateAttributes('inlineMath', { latex: trimmed }).run();
                }
              }
              previewInsertedRef.current = false;
              previewPosRef.current = null;
              setMathState({ mode: 'edit', open: false, latex: '', pos: null, anchorRect: null });
            }}
          />

          <EditorContent editor={editor} role='presentation' className='simple-editor-content' />
        </EditorContext.Provider>
      </div>
    </div>
  );
}
