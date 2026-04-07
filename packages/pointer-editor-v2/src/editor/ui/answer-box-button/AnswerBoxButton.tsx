import * as React from 'react';

// --- Lib ---
import { parseShortcutKeys } from '../../utils';

// --- Tiptap UI ---
import type { ColumnCount, UseAnswerBoxConfig } from './useAnswerBox';
import { ANSWER_BOX_SHORTCUT_KEYS, useAnswerBox } from './useAnswerBox';

// --- UI Primitives ---
import type { ButtonProps } from '../base';
import { Button, Badge } from '../base';
import { useTiptapEditor } from '../../hooks';

export interface AnswerBoxButtonProps extends Omit<ButtonProps, 'type'>, UseAnswerBoxConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string;
  /**
   * Optional show shortcut keys in the button.
   * @default false
   */
  showShortcut?: boolean;
}

export function AnswerBoxShortcutBadge({
  columnCount,
  shortcutKeys = ANSWER_BOX_SHORTCUT_KEYS[columnCount],
}: {
  columnCount: ColumnCount;
  shortcutKeys?: string;
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

/**
 * Button component for toggling heading in a Tiptap editor.
 *
 * For custom button implementations, use the `useHeading` hook instead.
 */
export const AnswerBoxButton = React.forwardRef<HTMLButtonElement, AnswerBoxButtonProps>(
  (
    {
      editor: providedEditor,
      columnCount,
      text,
      hideWhenUnavailable = false,
      onToggled,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, isActive, handleAdd, canInsert, label, Icon, shortcutKeys } = useAnswerBox({
      editor,
      columnCount,
      hideWhenUnavailable,
      onToggled,
    });

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        handleAdd();
      },
      [handleAdd, onClick]
    );

    if (!isVisible) {
      return null;
    }

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
        onClick={handleClick}
        {...buttonProps}
        ref={ref}>
        {children ?? (
          <>
            <Icon className='tiptap-button-icon' />
            {text && <span className='tiptap-button-text'>{text}</span>}
            {showShortcut && (
              <AnswerBoxShortcutBadge columnCount={columnCount} shortcutKeys={shortcutKeys} />
            )}
          </>
        )}
      </Button>
    );
  }
);

AnswerBoxButton.displayName = 'AnswerBoxButton';
