'use client';

import * as React from 'react';
import { type Editor } from '@tiptap/react';

// --- Hooks ---
import { useTiptapEditor } from '../../hooks';

// --- Lib ---
import { isNodeInSchema, isNodeTypeSelected } from '../../utils';

// --- Icons ---
import { AnswerBoxOneColIcon, AnswerBoxThreeColsIcon, AnswerBoxFiveColsIcon } from '../../assets';

export type ColumnCount = 1 | 3 | 5;

/**
 * Configuration for the heading functionality
 */
export interface UseAnswerBoxConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * The heading level.
   */
  columnCount: ColumnCount;
  /**
   * Whether the button should hide when heading is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback function called after a successful heading toggle.
   */
  onToggled?: () => void;
}

export const headingIcons = {
  1: AnswerBoxOneColIcon,
  3: AnswerBoxThreeColsIcon,
  5: AnswerBoxFiveColsIcon,
};

export const ANSWER_BOX_SHORTCUT_KEYS: Record<ColumnCount, string> = {
  1: 'ctrl+alt+1',
  3: 'ctrl+alt+3',
  5: 'ctrl+alt+5',
};

const SIZE_MAP: Record<ColumnCount, { cols: number; rows: number }> = {
  1: { cols: 1, rows: 5 },
  3: { cols: 3, rows: 2 },
  5: { cols: 5, rows: 1 },
};

export function insertAnswerBox(editor: Editor | null, columnCount: ColumnCount): boolean {
  if (!editor || !editor.isEditable) return false;
  const size = SIZE_MAP[columnCount];
  if (!size) return false;

  return editor
    .chain()
    .focus()
    .insertTable({ rows: size.rows, cols: size.cols, withHeaderRow: false })
    .run();
}

export function canInsertAnswerBox(editor: Editor | null, columnCount?: ColumnCount): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!columnCount) return false;

  // table 스키마 있는지, 이미지 같은 비편집 노드 선택 상태인지 체크(선택)
  if (!isNodeInSchema('table', editor) || isNodeTypeSelected(editor, ['image'])) return false;

  // 테이블 안에 또 삽입을 막고 싶다면(선택)
  // if (editor.isActive('table')) return false;

  const size = SIZE_MAP[columnCount];
  return !!size && editor.can().insertTable({ rows: size.rows, cols: size.cols });
}

/**
 * Custom hook that provides heading functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MySimpleHeadingButton() {
 *   const { isVisible, isActive, handleToggle, Icon } = useHeading({ level: 1 })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <button
 *       onClick={handleToggle}
 *       aria-pressed={isActive}
 *     >
 *       <Icon />
 *       Heading 1
 *     </button>
 *   )
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedHeadingButton() {
 *   const { isVisible, isActive, handleToggle, label, Icon } = useHeading({
 *     level: 2,
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *     onToggled: (isActive) => console.log('Heading toggled:', isActive)
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleToggle}
 *       aria-label={label}
 *       aria-pressed={isActive}
 *     >
 *       <Icon />
 *       Toggle Heading 2
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useAnswerBox(config: UseAnswerBoxConfig) {
  const { editor: providedEditor, columnCount, hideWhenUnavailable = false, onToggled } = config;

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);
  const canInsert = canInsertAnswerBox(editor, columnCount);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      if (hideWhenUnavailable) {
        setIsVisible(canInsertAnswerBox(editor, columnCount));
      } else {
        setIsVisible(true);
      }
    };

    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, columnCount, hideWhenUnavailable]);

  const handleAdd = React.useCallback(() => {
    if (!editor) return false;
    const success = insertAnswerBox(editor, columnCount);
    if (success) {
      onToggled?.();
    }
    return success;
  }, [editor, columnCount, onToggled]);

  return {
    isVisible,
    isActive: false as const,
    handleAdd,
    canInsert,
    label: `Answer Box: ${columnCount} cols`,
    shortcutKeys: ANSWER_BOX_SHORTCUT_KEYS[columnCount],
    Icon: headingIcons[columnCount],
  };
}
