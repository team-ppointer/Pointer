import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';

window.katex = katex;

// Quill Keyboard 모듈 커스텀 등록 (최초 1회만)
if (!window.__quillCustomKeyboardRegistered) {
  const Keyboard = Quill.import('modules/keyboard');
  class CustomKeyboard extends Keyboard {
    static DEFAULTS = {
      ...Keyboard.DEFAULTS,
      bindings: {
        ...Keyboard.DEFAULTS.bindings,
        ['list autofill']: undefined,
      },
    };
  }
  Quill.register('modules/keyboard', CustomKeyboard, true);
  window.__quillCustomKeyboardRegistered = true;
}

const formulaStyles = `
  .ql-editor .ql-formula {
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .ql-editor .ql-formula:hover {
    background-color: rgba(0, 123, 255, 0.1);
    border-radius: 3px;
  }
  
  .ql-editor {
    tab-size: 0;
    -moz-tab-size: 0;
    white-space: pre-wrap;
    text-indent: 0 !important;
    min-height: inherit;
  }
  
  .ql-container {
    min-height: inherit;
    height: auto !important;
  }
  
  .quill-no-border .ql-container {
    border: none;
    min-height: inherit;
    height: auto !important;
  }
  
  .quill-no-border .ql-editor {
    padding: 12px;
    min-height: calc(150px - 24px);
  }
  
  .ql-editor img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 10px auto;
  }
  
  .ql-editor p {
    margin: 0;
    line-height: 1.6;
    text-indent: 0 !important;
    padding-left: 0 !important;
  }
  
  /* 모든 들여쓰기 관련 스타일 제거 */
  .ql-editor * {
    text-indent: 0 !important;
  }
`;

// 스타일 태그가 이미 추가되었는지 확인하기 위한 플래그
let stylesAdded = false;

const useQuillEditor = ({
  containerRef,
  initialContent,
  onTextChange,
  onFormulaClick,
  onInitialized,
  onImagePaste, // 이미지 붙여넣기 핸들러 추가
  isInsertableImage = false,
}) => {
  const quillRef = useRef(null);
  const adjustContainerHeightRef = useRef(null);

  useEffect(() => {
    // CSS 스타일을 한 번만 추가
    if (!stylesAdded) {
      const styleElement = document.createElement('style');
      styleElement.textContent = formulaStyles;
      document.head.appendChild(styleElement);
      stylesAdded = true;
    }

    const container = containerRef.current;
    if (!container) return;

    // 기존 에디터 컨테이너가 있다면 제거
    const existingEditor = container.querySelector('.ql-container');
    if (existingEditor) {
      container.removeChild(existingEditor.parentNode);
    }

    const editorContainer = document.createElement('div');
    container.appendChild(editorContainer);

    const quill = new Quill(editorContainer, {
      theme: 'snow',
      modules: {
        toolbar: false,
        indent: false, // 들여쓰기 모듈 비활성화
        keyboard: {
          bindings: {
            // 모든 기본 키보드 바인딩 제거하고 스페이스만 커스텀
            space: {
              key: 32,
              handler: function (range) {
                // 기본 스페이스 입력만 수행
                this.quill.insertText(range.index, ' ');
                return false;
              },
            },
            // 탭 키도 기본 동작만 수행
            tab: {
              key: 9,
              handler: function (range) {
                this.quill.insertText(range.index, '\t');
                return false;
              },
            },
            bindings: {
              'list autofill': {
                prefix: /^\s*()$/,
              },
            },
          },
        },
      },
    });

    // 자동 리스트 변환(list autofill) 바인딩 제거
    if (quill && quill.keyboard && quill.keyboard.bindings['list autofill']) {
      quill.keyboard.bindings['list autofill'] = [];
    }

    // 추가로 들여쓰기 관련 이벤트 리스너 제거
    const editor = quill.root;
    editor.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Tab') {
        // 기본 동작만 허용하고 들여쓰기 방지
        e.stopPropagation();
      }
    });

    quillRef.current = quill;

    // 초기 콘텐츠 설정
    if (initialContent) {
      quill.root.innerHTML = initialContent;
    }

    // 초기화 완료 콜백
    onInitialized?.();

    // 컨테이너 높이 계산
    const adjustContainerHeight = () => {
      if (!container || !quill) return;

      const editor = quill.root;
      const qlContainer = container.querySelector('.ql-container');

      if (editor && qlContainer) {
        const editorScrollHeight = editor.scrollHeight;
        const minHeight = 150;

        const adjustedHeight = Math.max(minHeight, editorScrollHeight + 24);

        container.style.height = `${adjustedHeight}px`;
        qlContainer.style.height = `${adjustedHeight}px`;

        editor.style.minHeight = `${minHeight - 24}px`;
      }
    };

    adjustContainerHeightRef.current = adjustContainerHeight;

    // 텍스트 변경 이벤트 핸들러
    const handleTextChange = () => {
      const content = quill.root.innerHTML;
      onTextChange?.(content);

      // DOM 업데이트 후 높이 조정
      setTimeout(() => adjustContainerHeightRef.current?.(), 0);
    };

    quill.on(Quill.events.TEXT_CHANGE, handleTextChange);

    // DOM 업데이트 후 높이 조정
    setTimeout(() => adjustContainerHeightRef.current?.(), 0);

    const handleCopy = (e) => {
      try {
        const range = quill.getSelection();
        if (!range || range.length === 0) return;
        const delta = quill.getContents(range.index, range.length);
        let plain = '';
        (delta.ops || []).forEach((op) => {
          const insert = op.insert;
          if (insert == null) return;
          if (typeof insert === 'string') {
            plain += insert;
          } else if (insert.formula) {
            plain += `$${insert.formula}$`;
          }
        });

        if (plain) {
          e.preventDefault();
          let html = '';
          const sel = window.getSelection();
          if (sel && sel.rangeCount > 0) {
            const container = document.createElement('div');
            for (let i = 0; i < sel.rangeCount; i++) {
              container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
          }
          e.clipboardData.setData('text/plain', plain);
          if (html) e.clipboardData.setData('text/html', html);
        }
      } catch {}
    };

    const handlePaste = (e) => {
      try {
        // 클립보드에서 이미지 확인
        const items = e.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            // 이미지 타입인지 확인
            if (item.type.startsWith('image/')) {
              e.preventDefault();
              const file = item.getAsFile();
              if (file && onImagePaste) {
                onImagePaste(file);
                return;
              }
            }
          }
        }

        // 이미지가 없으면 기존 텍스트/수식 처리
        const text = e.clipboardData?.getData('text/plain') || '';
        if (!text || !/\$\$[\s\S]*?\$\$/.test(text)) return;

        e.preventDefault();
        const range = quill.getSelection();
        if (range && range.length) {
          quill.deleteText(range.index, range.length);
        }
        const insertIndex = range ? range.index : quill.getLength() - 1;

        let cursor = insertIndex;
        const regex = /\$\$([\s\S]*?)\$\$/g;
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(text)) !== null) {
          const before = text.slice(lastIndex, match.index);
          if (before) {
            quill.insertText(cursor, before);
            cursor += before.length;
          }
          const formula = match[1];
          if (formula) {
            quill.insertEmbed(cursor, 'formula', formula);
            cursor += 1;
          }
          lastIndex = match.index + match[0].length;
        }
        const tail = text.slice(lastIndex);
        if (tail) {
          quill.insertText(cursor, tail);
          cursor += tail.length;
        }
        quill.setSelection(cursor);
      } catch {}
    };

    editorContainer.addEventListener('copy', handleCopy);
    editorContainer.addEventListener('paste', handlePaste);

    // 수식 클릭 이벤트 핸들러
    const handleFormulaClick = (e) => {
      const formulaElement = e.target.closest('.ql-formula');
      if (formulaElement) {
        e.preventDefault();
        e.stopPropagation();

        const formulaValue = formulaElement.getAttribute('data-value');

        if (formulaValue) {
          const blot = Quill.find(formulaElement);
          if (blot) {
            const index = quill.getIndex(blot);
            onFormulaClick?.(formulaValue, { index, length: 1 });
          }
        }
      }
    };

    editorContainer.addEventListener('click', handleFormulaClick);

    return () => {
      if (container && editorContainer.parentNode === container) {
        container.removeChild(editorContainer);
      }
      editorContainer.removeEventListener('copy', handleCopy);
      editorContainer.removeEventListener('paste', handlePaste);
      quillRef.current = null;
    };
  }, []); // 의존성 배열을 비워서 한 번만 실행

  // Quill 인스턴스와 관련 메서드들을 반환
  return {
    quillRef,
    getSelection: () => quillRef.current?.getSelection(),
    insertFormula: (formula, range) => {
      if (!quillRef.current) return;

      const quill = quillRef.current;
      let katexHtml = '';
      try {
        katexHtml = katex.renderToString(formula, { throwOnError: false, displayMode: true });
      } catch {
        katexHtml = '';
      }
      const html = `<span class=\"ql-formula\" data-value=\"${formula}\">\u200B<span contenteditable=\"false\"><span class=\"inline-display-math\">${katexHtml}</span></span>\u200B</span>`;

      if (range) {
        quill.deleteText(range.index, range.length);
        quill.clipboard.dangerouslyPasteHTML(range.index, html);
        quill.setSelection(range.index + 1);
      } else {
        const index = quill.getSelection()?.index ?? quill.getLength() - 1;
        quill.clipboard.dangerouslyPasteHTML(index, html);
        quill.setSelection(index + 1);
      }

      // DOM 업데이트 후 높이 조정
      setTimeout(() => adjustContainerHeightRef.current?.(), 0);
    },
    insertHtml: (html) => {
      if (!quillRef.current || !html) return;
      const quill = quillRef.current;
      const range = quill.getSelection();
      const index = range ? range.index : quill.getLength() - 1;
      // Use Quill clipboard to paste sanitized HTML at the current cursor (or end)
      quill.clipboard.dangerouslyPasteHTML(index, html);

      // DOM 업데이트 후 높이 조정
      setTimeout(() => adjustContainerHeightRef.current?.(), 0);
    },
    insertImage: isInsertableImage
      ? (imageUrl) => {
          if (!quillRef.current) return;

          const range = quillRef.current.getSelection();
          if (range) {
            // 선택된 텍스트가 있으면 이미지로 교체
            quillRef.current.deleteText(range.index, range.length);
            quillRef.current.insertEmbed(range.index, 'image', imageUrl);
            quillRef.current.setSelection(range.index + 1);
          } else {
            // 커서 위치에 이미지 삽입
            const length = quillRef.current.getLength();
            quillRef.current.insertEmbed(length - 1, 'image', imageUrl);
            quillRef.current.setSelection(length);
          }

          // DOM 업데이트 후 높이 조정
          setTimeout(() => adjustContainerHeightRef.current?.(), 0);
        }
      : undefined,
    getContent: () => quillRef.current?.root.innerHTML || '',
  };
};

export default useQuillEditor;
