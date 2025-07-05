import { useEffect, useRef, useReducer, useCallback, useMemo, memo } from 'react';
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Functions,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
} from '@mui/icons-material';
import katex from 'katex';

import { BoldIcon, ItalicIcon, UnderlineIcon, ColorIcon, BoxIcon } from '../../../assets';

import useQuillEditor from './hooks/useQuillEditor';
import FormulaModal from './FormulaModal';
import 'katex/dist/katex.min.css';

// 상태 관리를 위한 초기 상태 정의
const initialState = {
  // 스타일 관련 상태
  alignment: 'left',
  hasBorder: false,
  borderStyle: '1px solid black', // 기본 border 스타일
  innerPadding: 'medium',
  isBold: false,
  isItalic: false,
  isUnderline: false,
  hasColor: false,
  textColor: '#000000',

  // 에디터 상태
  isInitialized: false,

  // 수식 모달 관련 상태
  isFormulaModalOpen: false,
  editingFormula: '',
  isEditMode: false,

  // 이미지 삽입 모달 관련 상태
  isImageModalOpen: false,
  imageUrl: '',

  // 색상 선택 모달 관련 상태
  isColorModalOpen: false,
  selectedColor: '#000000',

  // 추적용 상태
  lastInitialDataStyle: null,
  isStyleUpdatedByUser: false, // 사용자가 스타일을 변경했는지 추적
};

// 액션 타입 정의
const actionTypes = {
  SET_STYLE_FROM_INITIAL_DATA: 'SET_STYLE_FROM_INITIAL_DATA',
  SET_ALIGNMENT: 'SET_ALIGNMENT',
  SET_BORDER: 'SET_BORDER',
  SET_INNER_PADDING: 'SET_INNER_PADDING',
  SET_BOLD: 'SET_BOLD',
  SET_ITALIC: 'SET_ITALIC',
  SET_UNDERLINE: 'SET_UNDERLINE',
  SET_TEXT_COLOR: 'SET_TEXT_COLOR',
  SET_INITIALIZED: 'SET_INITIALIZED',
  OPEN_FORMULA_MODAL: 'OPEN_FORMULA_MODAL',
  CLOSE_FORMULA_MODAL: 'CLOSE_FORMULA_MODAL',
  OPEN_IMAGE_MODAL: 'OPEN_IMAGE_MODAL',
  CLOSE_IMAGE_MODAL: 'CLOSE_IMAGE_MODAL',
  SET_IMAGE_URL: 'SET_IMAGE_URL',
  OPEN_COLOR_MODAL: 'OPEN_COLOR_MODAL',
  CLOSE_COLOR_MODAL: 'CLOSE_COLOR_MODAL',
  SET_SELECTED_COLOR: 'SET_SELECTED_COLOR',
  RESET_STYLE_UPDATE_FLAG: 'RESET_STYLE_UPDATE_FLAG',
};

const parseStyleString = (styleString) => {
  const result = {
    alignment: 'left',
    hasBorder: false,
    borderStyle: '1px solid black', // 기본값
    innerPadding: 'medium',
    isBold: false,
    isItalic: false,
    isUnderline: false,
    hasColor: false,
    textColor: '#000000',
  };

  if (!styleString) {
    return result;
  }

  const alignMatch = styleString.match(/text-align:\s*([^;]+)/);
  const borderMatch = styleString.match(/border:\s*([^;]+)/);
  const paddingMatch = styleString.match(/padding:\s*([^;]+)/);
  const fontWeightMatch = styleString.match(/font-weight:\s*([^;]+)/);
  const fontStyleMatch = styleString.match(/font-style:\s*([^;]+)/);
  const textDecorationMatch = styleString.match(/text-decoration:\s*([^;]+)/);
  const colorMatch = styleString.match(/color:\s*([^;]+)/);

  if (alignMatch) {
    result.alignment = alignMatch[1].trim();
  }

  if (borderMatch && borderMatch[1].trim() && borderMatch[1].trim() !== 'none') {
    result.hasBorder = true;
    result.borderStyle = borderMatch[1].trim(); // 원본 border 스타일 보존
  }

  if (paddingMatch) {
    const paddingValue = parseInt(paddingMatch[1].trim(), 10);
    if (!isNaN(paddingValue)) {
      if (paddingValue <= 10) result.innerPadding = 'small';
      else if (paddingValue <= 20) result.innerPadding = 'medium';
      else result.innerPadding = 'large';
    }
  }

  if (fontWeightMatch) {
    result.isBold = fontWeightMatch[1].trim() === 'bold';
  }

  if (fontStyleMatch) {
    result.isItalic = fontStyleMatch[1].trim() === 'italic';
  }

  if (textDecorationMatch) {
    result.isUnderline = textDecorationMatch[1].trim().includes('underline');
  }

  if (colorMatch) {
    result.hasColor = true;
    result.textColor = colorMatch[1].trim();
  }

  return result;
};

// Reducer 함수
const editorReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_STYLE_FROM_INITIAL_DATA: {
      const { styleString } = action.payload;

      if (state.lastInitialDataStyle === styleString) {
        return state;
      }

      // 사용자가 스타일을 변경한 상태에서 텍스트만 변경된 경우 스타일 파싱을 건너뜀
      if (state.isStyleUpdatedByUser) {
        return {
          ...state,
          lastInitialDataStyle: styleString,
          isStyleUpdatedByUser: false,
        };
      }

      const parsedStyle = parseStyleString(styleString);
      const newState = {
        ...state,
        ...parsedStyle,
        lastInitialDataStyle: styleString,
      };

      return newState;
    }

    case actionTypes.SET_ALIGNMENT:
      return {
        ...state,
        alignment: action.payload,
        isStyleUpdatedByUser: true,
      };

    case actionTypes.SET_BORDER:
      return {
        ...state,
        hasBorder: action.payload,
        isStyleUpdatedByUser: true,
      };

    case actionTypes.SET_INNER_PADDING:
      return {
        ...state,
        innerPadding: action.payload,
        isStyleUpdatedByUser: true,
      };

    case actionTypes.SET_BOLD:
      return {
        ...state,
        isBold: action.payload,
        isStyleUpdatedByUser: true,
      };

    case actionTypes.SET_ITALIC:
      return {
        ...state,
        isItalic: action.payload,
        isStyleUpdatedByUser: true,
      };

    case actionTypes.SET_UNDERLINE:
      return {
        ...state,
        isUnderline: action.payload,
        isStyleUpdatedByUser: true,
      };

    case actionTypes.SET_TEXT_COLOR:
      return {
        ...state,
        textColor: action.payload,
        hasColor: true,
        isStyleUpdatedByUser: true,
      };

    case actionTypes.SET_INITIALIZED:
      return { ...state, isInitialized: action.payload };

    case actionTypes.OPEN_FORMULA_MODAL:
      return {
        ...state,
        isFormulaModalOpen: true,
        editingFormula: action.payload?.formula || '',
        isEditMode: action.payload?.isEdit || false,
      };

    case actionTypes.CLOSE_FORMULA_MODAL:
      return {
        ...state,
        isFormulaModalOpen: false,
        editingFormula: '',
        isEditMode: false,
      };

    case actionTypes.OPEN_IMAGE_MODAL:
      return {
        ...state,
        isImageModalOpen: true,
        imageUrl: action.payload?.imageUrl || '',
      };

    case actionTypes.CLOSE_IMAGE_MODAL:
      return {
        ...state,
        isImageModalOpen: false,
        imageUrl: '',
      };

    case actionTypes.SET_IMAGE_URL:
      return {
        ...state,
        imageUrl: action.payload,
      };

    case actionTypes.OPEN_COLOR_MODAL:
      return {
        ...state,
        isColorModalOpen: true,
      };

    case actionTypes.CLOSE_COLOR_MODAL:
      return {
        ...state,
        isColorModalOpen: false,
      };

    case actionTypes.SET_SELECTED_COLOR:
      return {
        ...state,
        selectedColor: action.payload,
      };

    case actionTypes.RESET_STYLE_UPDATE_FLAG:
      return { ...state, isStyleUpdatedByUser: false };

    default:
      return state;
  }
};

// $...$를 <span class="ql-formula" data-value="..."></span>로 변환 (내부에 KaTeX HTML 포함)
function latexToQuillFormulaHtml(text) {
  if (!text) return '';
  // 1. $...$를 모두 변환

  // text를 개행 단위로 분리 (p태그 단위)
  const splitText = text.split('\n');

  let html = '';
  for (let i = 0; i < splitText.length; i++) {
    html += `<p>${splitText[i]}</p>`;
  }

  html = html.replace(/\$([^\$]+)\$/g, (match, formula) => {
    let katexHtml = '';
    try {
      katexHtml = katex.renderToString(formula, { throwOnError: false });
    } catch {
      katexHtml = '';
    }
    return `<span class="ql-formula" data-value="${formula}">\uFEFF<span contenteditable="false">${katexHtml}</span>\uFEFF</span>`;
  });
  // 3. 연속 공백을 &nbsp;로 변환 (HTML 태그 내부는 제외)
  html = html.replace(/  +/g, (spaces) => '&nbsp;'.repeat(spaces.length));
  // 4. 전체를 하나의 p태그로 감싸기
  return html;
}

// Quill HTML을 $$...$$ LaTeX 텍스트로 변환하는 함수
function quillHtmlToLatex(html) {
  if (!html) return '';

  // make domTree from html
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const pTags = doc.querySelectorAll('p');

  let result = '';
  // iter pTags
  for (let i = 0; i < pTags.length; i++) {
    const pTag = pTags[i];
    // p태그의 모든 자식 노드를 순서대로 처리
    for (let node of pTag.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        // 텍스트 노드인 경우
        result += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // 요소 노드인 경우
        if (node.classList && node.classList.contains('ql-formula')) {
          // LaTeX 수식인 경우
          let formula = node.getAttribute('data-value');
          result += `$${formula}$`;
        } else {
          // 다른 요소인 경우 (span, strong, em 등)
          result += node.textContent;
        }
      }
    }
    if (i < pTags.length - 1) {
      result += '\n';
    }
  }
  return result;
}

const TextBlockEditor = memo(
  ({ initialData, onChange, blockId, isInsertableImage = false }) => {
    const containerRef = useRef(null);
    const savedRangeRef = useRef(null);

    // useReducer로 상태 관리 통합
    const [state, dispatch] = useReducer(editorReducer, initialState);

    // 최신 상태를 추적하기 위한 ref
    const stateRef = useRef(state);

    // initialData를 그대로 유지 (LaTeX 형태)
    const externalData = useMemo(
      () => ({
        content: initialData?.content || initialData?.data || '',
        style: initialData?.style || '',
      }),
      [initialData]
    );

    // 렌더링용 데이터 (Quill HTML로 변환)
    const renderingData = useMemo(() => {
      const content = externalData.content;
      // 이미 HTML(Quill) 형태면 그대로, 아니면 변환
      if (content && content.includes('ql-formula')) {
        return {
          content: content,
          style: externalData.style,
        };
      }
      // $...$ 패턴을 Quill HTML로 변환
      return {
        content: latexToQuillFormulaHtml(content),
        style: externalData.style,
      };
    }, [externalData]);

    // 패딩 값 매핑
    const paddingValues = useMemo(
      () => ({
        small: 8,
        medium: 16,
        large: 24,
      }),
      []
    );

    // 상태가 변경될 때마다 ref 업데이트
    useEffect(() => {
      stateRef.current = state;
    }, [state]);

    // 스타일 생성 함수 (ref를 사용하여 최신 상태 참조)
    const generateCurrentStyleFromRef = useCallback(() => {
      const currentState = stateRef.current;
      const paddingPx = paddingValues[currentState.innerPadding];
      const styles = [`text-align: ${currentState.alignment}`, `padding: ${paddingPx}px`];

      if (currentState.hasBorder) {
        styles.push(`border: ${currentState.borderStyle}`);
      }

      if (currentState.isBold) {
        styles.push('font-weight: bold');
      }

      if (currentState.isItalic) {
        styles.push('font-style: italic');
      }

      if (currentState.isUnderline) {
        styles.push('text-decoration: underline');
      }

      if (currentState.hasColor) {
        styles.push(`color: ${currentState.textColor}`);
      }

      return styles.join('; ') + ';';
    }, [paddingValues]);

    // 기존 스타일 생성 함수 (UI용)
    const generateCurrentStyle = useCallback(() => {
      const paddingPx = paddingValues[state.innerPadding];
      const styles = [`text-align: ${state.alignment}`, `padding: ${paddingPx}px`];

      if (state.hasBorder) {
        styles.push(`border: ${state.borderStyle}`);
      }

      if (state.isBold) {
        styles.push('font-weight: bold');
      }

      if (state.isItalic) {
        styles.push('font-style: italic');
      }

      if (state.isUnderline) {
        styles.push('text-decoration: underline');
      }

      if (state.hasColor) {
        styles.push(`color: ${state.textColor}`);
      }

      return styles.join('; ') + ';';
    }, [
      state.alignment,
      state.hasBorder,
      state.innerPadding,
      paddingValues,
      state.borderStyle,
      state.isBold,
      state.isItalic,
      state.isUnderline,
      state.hasColor,
      state.textColor,
    ]);

    // 블록 데이터 업데이트 함수 - externalData 형태로 저장
    const updateBlock = useCallback(
      (content, style) => {
        // content(HTML)를 LaTeX로 변환해서 저장
        const latexContent = quillHtmlToLatex(content);
        const blockData = {
          type: 'TEXT',
          content: latexContent, // LaTeX 형태로 저장
          style: style,
        };
        onChange?.(blockData);
      },
      [onChange, blockId]
    );

    // Quill 에디터 이벤트 핸들러들 (ref를 사용하여 최신 상태 참조)
    const handleTextChange = useCallback(
      (content) => {
        const currentStyle = generateCurrentStyleFromRef();
        updateBlock(content, currentStyle);
      },
      [generateCurrentStyleFromRef, updateBlock]
    );

    const handleFormulaClick = useCallback((formulaValue, range) => {
      savedRangeRef.current = range;
      dispatch({
        type: actionTypes.OPEN_FORMULA_MODAL,
        payload: { formula: formulaValue, isEdit: true },
      });
    }, []);

    const handleEditorInitialized = useCallback(() => {
      dispatch({ type: actionTypes.SET_INITIALIZED, payload: true });
    }, []);

    // Quill 에디터 초기화 - renderingData 사용
    const { getSelection, insertFormula, getContent, insertImage } = useQuillEditor({
      containerRef,
      initialContent: renderingData.content, // 렌더링용 데이터 사용
      onTextChange: handleTextChange,
      onFormulaClick: handleFormulaClick,
      onInitialized: handleEditorInitialized,
      isInsertableImage,
    });

    // 키보드 단축키 핸들러 (useQuillEditor 이후에 정의)
    const handleKeyDown = useCallback(
      (e) => {
        // Cmd+M (맥) 또는 Ctrl+Shift+M (윈도우) - 수식 삽입
        if ((e.metaKey && e.key === 'm') || (e.ctrlKey && e.shiftKey && e.key === 'M')) {
          // 현재 포커스된 요소가 이 TextBlockEditor 내부에 있는지 확인
          const isFocusedInThisEditor = containerRef.current?.contains(document.activeElement);

          if (isFocusedInThisEditor) {
            e.preventDefault();
            // 수식 모달 열기
            savedRangeRef.current = getSelection();
            dispatch({
              type: actionTypes.OPEN_FORMULA_MODAL,
              payload: { formula: '', isEdit: false },
            });
          }
        }
      },
      [getSelection]
    );

    // Quill 에디터가 초기화된 후 키보드 이벤트 리스너 추가
    useEffect(() => {
      if (getSelection) {
        document.addEventListener('keydown', handleKeyDown);

        return () => {
          document.removeEventListener('keydown', handleKeyDown);
        };
      }
    }, [getSelection, handleKeyDown]);

    // externalData.style 변경 감지 및 상태 업데이트 (prop 변경 시)
    useEffect(() => {
      dispatch({
        type: actionTypes.SET_STYLE_FROM_INITIAL_DATA,
        payload: { styleString: externalData.style },
      });
    }, [externalData.style]);

    // 스타일 변경 시에만 업데이트 (사용자가 스타일을 변경했을 때)
    useEffect(() => {
      if (state.isInitialized && state.isStyleUpdatedByUser) {
        const content = getContent();
        const currentStyle = generateCurrentStyle();

        updateBlock(content, currentStyle);

        // 플래그 리셋
        dispatch({ type: actionTypes.RESET_STYLE_UPDATE_FLAG });
      }
    }, [
      state.isStyleUpdatedByUser,
      state.isInitialized,
      getContent,
      generateCurrentStyle,
      updateBlock,
    ]);

    const handleFormulaSave = (formula) => {
      if (formula) {
        const range = savedRangeRef.current;

        if (state.isEditMode && range) {
          insertFormula(formula, range);
        } else {
          insertFormula(formula, range);
        }

        savedRangeRef.current = null;
      }
    };

    const handleFormulaModalClose = () => {
      dispatch({ type: actionTypes.CLOSE_FORMULA_MODAL });
      savedRangeRef.current = null;
    };

    // 이미지 관련 핸들러들
    // const handleImage = () => {
    //   dispatch({ type: actionTypes.OPEN_IMAGE_MODAL });
    // };

    const handleImageSave = () => {
      if (state.imageUrl && insertImage) {
        insertImage(state.imageUrl);
        dispatch({ type: actionTypes.CLOSE_IMAGE_MODAL });
      }
    };

    const handleImageModalClose = () => {
      dispatch({ type: actionTypes.CLOSE_IMAGE_MODAL });
    };

    const handleImageUrlChange = (e) => {
      dispatch({ type: actionTypes.SET_IMAGE_URL, payload: e.target.value });
    };

    // 색상 관련 핸들러들
    const handleColor = () => {
      dispatch({ type: actionTypes.OPEN_COLOR_MODAL });
    };

    const handleColorSave = () => {
      if (state.selectedColor) {
        dispatch({ type: actionTypes.SET_TEXT_COLOR, payload: state.selectedColor });
        dispatch({ type: actionTypes.CLOSE_COLOR_MODAL });
      }
    };

    const handleColorModalClose = () => {
      dispatch({ type: actionTypes.CLOSE_COLOR_MODAL });
    };

    const handleColorChange = (e) => {
      dispatch({ type: actionTypes.SET_SELECTED_COLOR, payload: e.target.value });
    };

    return (
      <>
        {/* 스타일 옵션 영역 */}
        <Box sx={{ mb: 1 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant='outlined'
                size='small'
                onClick={() => {
                  savedRangeRef.current = getSelection();
                  dispatch({
                    type: actionTypes.OPEN_FORMULA_MODAL,
                    payload: { formula: '', isEdit: false },
                  });
                }}
                startIcon={<Functions />}
                title='수식 삽입 (⌘+M / Ctrl+Shift+M)'>
                수식 삽입 (⌘+Shift+M / Ctrl+Shift+M)
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <Button
              variant={state.isBold ? 'contained' : 'outlined'}
              size='small'
              onClick={() => {
                dispatch({ type: actionTypes.SET_BOLD, payload: !state.isBold });
                const content = getContent();
                const currentStyle = generateCurrentStyle();
                updateBlock(content, currentStyle);
              }}>
              <BoldIcon width={10} height={14} />
            </Button>
            <Button
              variant={state.isItalic ? 'contained' : 'outlined'}
              size='small'
              onClick={() => {
                dispatch({ type: actionTypes.SET_ITALIC, payload: !state.isItalic });
                const content = getContent();
                const currentStyle = generateCurrentStyle();
                updateBlock(content, currentStyle);
              }}>
              <ItalicIcon width={10} height={12} />
            </Button>
            <Button
              variant={state.isUnderline ? 'contained' : 'outlined'}
              size='small'
              onClick={() => {
                dispatch({ type: actionTypes.SET_UNDERLINE, payload: !state.isUnderline });
                const content = getContent();
                const currentStyle = generateCurrentStyle();
                updateBlock(content, currentStyle);
              }}>
              <UnderlineIcon width={16} height={16} />
            </Button>
            <Button
              variant={state.hasColor ? 'contained' : 'outlined'}
              size='small'
              onClick={handleColor}>
              <ColorIcon width={16} height={16} />
            </Button>
            <Button
              variant={state.hasBorder ? 'contained' : 'outlined'}
              size='small'
              onClick={() => {
                const newBorderState = !state.hasBorder;
                dispatch({ type: actionTypes.SET_BORDER, payload: newBorderState });

                // border를 끄면 padding도 기본값으로 돌아가게
                if (!newBorderState) {
                  dispatch({ type: actionTypes.SET_INNER_PADDING, payload: 'medium' });
                }

                const content = getContent();
                const currentStyle = generateCurrentStyle();
                updateBlock(content, currentStyle);
              }}>
              <BoxIcon width={14} height={14} />
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mt: 1 }}>
            {/* 정렬 옵션 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant='body2' sx={{ minWidth: 40 }}>
                정렬:
              </Typography>
              <ToggleButtonGroup
                value={state.alignment}
                exclusive
                onChange={(e, newAlignment) => {
                  if (newAlignment !== null) {
                    dispatch({ type: actionTypes.SET_ALIGNMENT, payload: newAlignment });
                    // 스타일 즉시 반영
                    const content = getContent();
                    const currentStyle = generateCurrentStyle();
                    updateBlock(content, currentStyle);
                  }
                }}
                size='small'>
                <ToggleButton value='left' aria-label='왼쪽 정렬'>
                  <FormatAlignLeft />
                </ToggleButton>
                <ToggleButton value='center' aria-label='가운데 정렬'>
                  <FormatAlignCenter />
                </ToggleButton>
                <ToggleButton value='right' aria-label='오른쪽 정렬'>
                  <FormatAlignRight />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* 내부 여백 선택 */}
            {state.hasBorder && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant='body2' sx={{ minWidth: 60 }}>
                  내부 여백:
                </Typography>
                <ToggleButtonGroup
                  value={state.innerPadding}
                  exclusive
                  onChange={(e, newPadding) => {
                    if (newPadding !== null) {
                      dispatch({ type: actionTypes.SET_INNER_PADDING, payload: newPadding });
                      const content = getContent();
                      const currentStyle = generateCurrentStyle();
                      updateBlock(content, currentStyle);
                    }
                  }}
                  size='small'>
                  <ToggleButton value='small' aria-label='작게'>
                    <Typography variant='caption'>작게</Typography>
                  </ToggleButton>
                  <ToggleButton value='medium' aria-label='보통'>
                    <Typography variant='caption'>보통</Typography>
                  </ToggleButton>
                  <ToggleButton value='large' aria-label='크게'>
                    <Typography variant='caption'>크게</Typography>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}
          </Box>
        </Box>

        {/* Quill 에디터 컨테이너 */}
        <div
          ref={containerRef}
          style={{
            height: '300px',
            border: '1px solid #e0e0e0', // 항상 고정
            borderRadius: '4px',
            padding: '16px', // 항상 고정
          }}
        />

        {/* 수식 모달 */}
        <FormulaModal
          isOpen={state.isFormulaModalOpen}
          onClose={handleFormulaModalClose}
          onSave={handleFormulaSave}
          initialValue={state.editingFormula}
        />

        {/* 이미지 삽입 모달 */}
        <Dialog
          open={state.isImageModalOpen}
          onClose={handleImageModalClose}
          maxWidth='sm'
          fullWidth>
          <DialogTitle>이미지 삽입</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin='dense'
              label='이미지 URL'
              type='url'
              fullWidth
              variant='outlined'
              value={state.imageUrl}
              onChange={handleImageUrlChange}
              placeholder='https://example.com/image.jpg'
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleImageModalClose}>취소</Button>
            <Button onClick={handleImageSave} variant='contained' disabled={!state.imageUrl}>
              삽입
            </Button>
          </DialogActions>
        </Dialog>

        {/* 색상 선택 모달 */}
        <Dialog
          open={state.isColorModalOpen}
          onClose={handleColorModalClose}
          maxWidth='sm'
          fullWidth
          sx={{ zIndex: 99999 }}>
          <DialogTitle>글자색 선택</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                autoFocus
                margin='dense'
                label='색상 코드'
                type='color'
                fullWidth
                variant='outlined'
                value={state.selectedColor}
                onChange={handleColorChange}
                sx={{
                  '& input[type="color"]': {
                    height: '50px',
                    cursor: 'pointer',
                  },
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[
                  '#000000',
                  '#FF0000',
                  '#00FF00',
                  '#0000FF',
                  '#FFFF00',
                  '#FF00FF',
                  '#00FFFF',
                  '#FFA500',
                  '#800080',
                  '#008000',
                ].map((color) => (
                  <Box
                    key={color}
                    sx={{
                      width: 40,
                      height: 40,
                      backgroundColor: color,
                      border: '2px solid #ccc',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      '&:hover': {
                        border: '2px solid #666',
                      },
                    }}
                    onClick={() => {
                      dispatch({ type: actionTypes.SET_SELECTED_COLOR, payload: color });
                      dispatch({ type: actionTypes.SET_TEXT_COLOR, payload: color });
                    }}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleColorModalClose}>취소</Button>
            <Button onClick={handleColorSave} variant='contained'>
              적용
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  },
  (prevProps, nextProps) => {
    // initialData가 변경된 경우에만 리렌더링
    return (
      prevProps.problemId === nextProps.problemId &&
      prevProps.blockId === nextProps.blockId &&
      prevProps.isInsertableImage === nextProps.isInsertableImage &&
      prevProps.initialData?.type === nextProps.initialData?.type &&
      prevProps.initialData?.content === nextProps.initialData?.content &&
      prevProps.initialData?.data === nextProps.initialData?.data &&
      prevProps.initialData?.style === nextProps.initialData?.style &&
      prevProps.onChange === nextProps.onChange
    );
  }
);

TextBlockEditor.displayName = 'TextBlockEditor';

export default TextBlockEditor;
