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
  isInsertableImage = false,
}) => {
  const quillRef = useRef(null);

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

    // 텍스트 변경 이벤트 핸들러
    const handleTextChange = () => {
      const content = quill.root.innerHTML;
      onTextChange?.(content);
    };

    quill.on(Quill.events.TEXT_CHANGE, handleTextChange);

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
      quillRef.current = null;
    };
  }, []); // 의존성 배열을 비워서 한 번만 실행

  // Quill 인스턴스와 관련 메서드들을 반환
  return {
    quillRef,
    getSelection: () => quillRef.current?.getSelection(),
    insertFormula: (formula, range) => {
      if (!quillRef.current) return;

      if (range) {
        quillRef.current.deleteText(range.index, range.length);
        quillRef.current.insertEmbed(range.index, 'formula', formula);
        quillRef.current.setSelection(range.index + 1);
      } else {
        const length = quillRef.current.getLength();
        quillRef.current.insertEmbed(length - 1, 'formula', formula);
        quillRef.current.setSelection(length);
      }
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
        }
      : undefined,
    getContent: () => quillRef.current?.root.innerHTML || '',
  };
};

export default useQuillEditor;
