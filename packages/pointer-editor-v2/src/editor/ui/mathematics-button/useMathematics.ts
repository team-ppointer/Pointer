'use client';

import * as React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { type Editor } from '@tiptap/react';

import { useTiptapEditor } from '../../hooks';
import { isExtensionAvailable } from '../../utils';
import { MathsIcon } from '../../assets';

export const MATHEMATICS_SHORTCUT_KEY = 'mod+shift+m';

export interface UseMathematicsConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  mathInstanceId?: string;
}

export function useMathematics(config?: UseMathematicsConfig) {
  const { editor: providedEditor, hideWhenUnavailable = false, mathInstanceId } = config || {};
  const { editor } = useTiptapEditor(providedEditor);
  const [isVisible, setIsVisible] = React.useState<boolean>(true);

  const canInsert =
    !!editor?.isEditable &&
    !!editor?.can().insertContent({ type: 'inlineMath', attrs: { latex: 'x' } });
  const isActive = !!editor?.isActive('inlineMath');

  React.useEffect(() => {
    if (!editor) return;
    const handleSelectionUpdate = () => {
      const available = isExtensionAvailable(editor, ['inlineMath']);
      if (!available) {
        setIsVisible(false);
        return;
      }
      if (hideWhenUnavailable) {
        setIsVisible(canInsert);
      } else {
        setIsVisible(true);
      }
    };
    handleSelectionUpdate();
    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => {
      // Ensure cleanup returns void; TipTap's .off() returns Editor which violates Effect cleanup type
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable, canInsert]);

  const insertInlineMath = React.useCallback(() => {
    if (!editor) return false;

    const { state, view } = editor;
    const from = state?.selection?.from ?? null;
    if (typeof from !== 'number') return false;

    let rect: DOMRect | null = null;
    if (view) {
      try {
        const start = view.coordsAtPos(from);
        rect = new DOMRect(
          Math.min(start.left, start.right ?? start.left),
          Math.min(start.top, start.bottom ?? start.top),
          Math.max(1, Math.abs((start.right ?? start.left) - start.left)),
          Math.max(1, Math.abs((start.bottom ?? start.top) - start.top))
        );
      } catch {
        rect = null;
      }
    }

    const ev = new CustomEvent('pointer-open-inline-math', {
      detail: {
        mode: 'create',
        anchorRect: rect,
        pos: from,
        latex: '',
        editorId: mathInstanceId ?? null,
      },
      bubbles: true,
    });
    window.dispatchEvent(ev);

    return true;
  }, [editor, mathInstanceId]);

  useHotkeys(
    MATHEMATICS_SHORTCUT_KEY,
    (event) => {
      if (!editor?.isFocused) return;
      event.preventDefault();
      insertInlineMath();
    },
    {
      enabled: isVisible && canInsert,
      enableOnContentEditable: true,
    }
  );

  return {
    isVisible,
    isActive,
    canInsert,
    insertInlineMath,
    label: '수식',
    Icon: MathsIcon,
    shortcutKeys: MATHEMATICS_SHORTCUT_KEY,
  } as const;
}
