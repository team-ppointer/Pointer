import * as React from 'react';

import { parseShortcutKeys } from '../../utils';
import { useTiptapEditor } from '../../hooks';

import type { UseImageOCRConfig } from './useImageOcr';
import { IMAGE_OCR_SHORTCUT_KEY, useImageOCR } from './useImageOcr';

import type { ButtonProps } from '../base';
import { Button, Badge } from '../base';

export interface ImageOCRButtonProps extends Omit<ButtonProps, 'type'>, UseImageOCRConfig {
  text?: string;
  showShortcut?: boolean;
}

export function ImageOCRShortcutBadge({
  shortcutKeys = IMAGE_OCR_SHORTCUT_KEY,
}: {
  shortcutKeys?: string;
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

export const ImageOCRButton = React.forwardRef<HTMLButtonElement, ImageOCRButtonProps>(
  (
    {
      editor: providedEditor,
      text,
      hideWhenUnavailable = false,
      onInserted,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, canInsert, handleInsertOCRNode, label, isActive, shortcutKeys, Icon } =
      useImageOCR({ editor, hideWhenUnavailable, onInserted });

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleInsertOCRNode();
      },
      [handleInsertOCRNode, onClick]
    );

    if (!isVisible) return null;

    return (
      <Button
        type='button'
        data-style='ghost'
        data-active-state={isActive ? 'on' : 'off'}
        role='button'
        tabIndex={-1}
        disabled={!canInsert}
        data-disabled={!canInsert}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        shortcutKeys={shortcutKeys}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}>
        {children ?? (
          <>
            <Icon className='tiptap-button-icon' />
            {text && <span className='tiptap-button-text'>{text}</span>}
            {showShortcut && <ImageOCRShortcutBadge shortcutKeys={shortcutKeys} />}
          </>
        )}
      </Button>
    );
  }
);

ImageOCRButton.displayName = 'ImageOCRButton';
