'use client';

import * as React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { type Editor } from '@tiptap/react';

import { useTiptapEditor, useIsMobile } from '../../hooks';
import { isExtensionAvailable, isNodeTypeSelected } from '../../utils';
import { ImageOCRIcon } from '../../assets';

export const IMAGE_OCR_SHORTCUT_KEY = 'mod+shift+o';

export interface UseImageOCRConfig {
  editor?: Editor | null;
  hideWhenUnavailable?: boolean;
  onInserted?: () => void;
}

export function canInsertImageOCR(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, 'imageOCR') || isNodeTypeSelected(editor, ['image']))
    return false;
  return editor.can().insertContent({ type: 'imageOCR' });
}

export function isImageOCRActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  return editor.isActive('imageOCR');
}

export function insertImageOCR(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false;
  if (!canInsertImageOCR(editor)) return false;
  try {
    return editor.chain().focus().insertContent({ type: 'imageOCR' }).run();
  } catch {
    return false;
  }
}

export function shouldShowOCRButton(props: {
  editor: Editor | null;
  hideWhenUnavailable: boolean;
}): boolean {
  const { editor, hideWhenUnavailable } = props;
  if (!editor || !editor.isEditable) return false;
  if (!isExtensionAvailable(editor, 'imageOCR')) return false;
  if (hideWhenUnavailable && !editor.isActive('code')) {
    return canInsertImageOCR(editor);
  }
  return true;
}

export function useImageOCR(config?: UseImageOCRConfig) {
  const { editor: providedEditor, hideWhenUnavailable = false, onInserted } = config || {};
  const { editor } = useTiptapEditor(providedEditor);
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = React.useState<boolean>(true);
  const canInsert = canInsertImageOCR(editor);
  const isActive = isImageOCRActive(editor);

  React.useEffect(() => {
    if (!editor) return;
    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowOCRButton({ editor, hideWhenUnavailable }));
    };
    handleSelectionUpdate();
    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, hideWhenUnavailable]);

  const handleInsertOCRNode = React.useCallback(() => {
    if (!editor) return false;
    const success = insertImageOCR(editor);
    if (success) onInserted?.();
    return success;
  }, [editor, onInserted]);

  useHotkeys(
    IMAGE_OCR_SHORTCUT_KEY,
    (event) => {
      if (!editor?.isFocused) return;
      event.preventDefault();
      handleInsertOCRNode();
    },
    {
      enabled: isVisible && canInsert,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    }
  );

  return {
    isVisible,
    isActive,
    handleInsertOCRNode,
    canInsert,
    label: '텍스트 변환',
    shortcutKeys: IMAGE_OCR_SHORTCUT_KEY,
    Icon: ImageOCRIcon,
  };
}
