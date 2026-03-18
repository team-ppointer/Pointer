'use client';

import * as React from 'react';
import type { Editor } from '@tiptap/react';

// --- Hooks ---
import { useTiptapEditor } from '../../hooks';

// --- Icons ---
import { AnswerBoxIcon } from '../../assets';

// --- Tiptap UI ---
import { type ColumnCount } from '../answer-box-button';
import { canInsertAnswerBox } from '../answer-box-button';

/**
 * Configuration for the heading dropdown menu functionality
 */
export interface UseAnswerBoxDropdownMenuConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null;
  /**
   * Available heading levels to show in the dropdown
   * @default [1, 3, 5]
   */
  columnCounts?: ColumnCount[];
  /**
   * Whether the dropdown should hide when headings are not available.
   * @default false
   */
  hideWhenUnavailable?: boolean;
}

/**
 * Gets the currently active heading level from the available levels
 */
export function getActiveAnswerBoxColumnCount(
  editor: Editor | null,
  columnCounts: ColumnCount[] = [1, 3, 5]
): ColumnCount | undefined {
  if (!editor || !editor.isEditable) return undefined;
  return columnCounts.find((columnCount) => canInsertAnswerBox(editor, columnCount));
}

/**
 * Custom hook that provides heading dropdown menu functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage
 * function MyHeadingDropdown() {
 *   const {
 *     isVisible,
 *     activeLevel,
 *     isAnyHeadingActive,
 *     canToggle,
 *     levels,
 *   } = useHeadingDropdownMenu()
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <DropdownMenu>
 *       // dropdown content
 *     </DropdownMenu>
 *   )
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedHeadingDropdown() {
 *   const {
 *     isVisible,
 *     activeLevel,
 *   } = useHeadingDropdownMenu({
 *     editor: myEditor,
 *     levels: [1, 2, 3],
 *     hideWhenUnavailable: true,
 *   })
 *
 *   // component implementation
 * }
 * ```
 */
export function useAnswerBoxDropdownMenu(config?: UseAnswerBoxDropdownMenuConfig) {
  const {
    editor: providedEditor,
    columnCounts = [1, 3, 5],
    hideWhenUnavailable = false,
  } = config || {};

  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState(true);

  const activeColumnCount = getActiveAnswerBoxColumnCount(editor, columnCounts);
  const canInsertState = canInsertAnswerBox(editor, activeColumnCount);

  React.useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      setIsVisible(canInsertAnswerBox(editor, activeColumnCount));
    };

    handleSelectionUpdate();

    editor.on('selectionUpdate', handleSelectionUpdate);

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, activeColumnCount, hideWhenUnavailable]);

  return {
    isVisible,
    activeColumnCount,
    canInsert: canInsertState,
    columnCounts,
    label: '정답 박스',
    Icon: AnswerBoxIcon,
  };
}
