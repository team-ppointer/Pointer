'use client';

import * as React from 'react';

import { useTiptapEditor } from '../../hooks';
import type { ButtonProps } from '../base';
import { Button, Badge } from '../base';
import {
  MATHEMATICS_SHORTCUT_KEY,
  useMathematics,
  type UseMathematicsConfig,
} from './useMathematics';
import { parseShortcutKeys } from '../../utils';

export interface MathematicsButtonProps extends Omit<ButtonProps, 'type'>, UseMathematicsConfig {
  text?: string;
  showShortcut?: boolean;
}

export function MathematicsShortcutBadge({
  shortcutKeys = MATHEMATICS_SHORTCUT_KEY,
}: {
  shortcutKeys?: string;
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>;
}

export const MathematicsButton = React.forwardRef<HTMLButtonElement, MathematicsButtonProps>(
  (
    {
      editor: providedEditor,
      text,
      hideWhenUnavailable = false,
      mathInstanceId,
      onClick,
      children,
      showShortcut = false,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const { isVisible, isActive, canInsert, insertInlineMath, label, Icon, shortcutKeys } =
      useMathematics({
        editor,
        hideWhenUnavailable,
        mathInstanceId,
      });

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        insertInlineMath();
      },
      [insertInlineMath, onClick]
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
            {showShortcut && <MathematicsShortcutBadge shortcutKeys={shortcutKeys} />}
          </>
        )}
      </Button>
    );
  }
);

MathematicsButton.displayName = 'MathematicsButton';
