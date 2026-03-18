import * as React from 'react';

// --- Icons ---
import { ChevronDownIcon } from '../../assets';

// --- Hooks ---
import { useTiptapEditor } from '../../hooks';

// --- Tiptap UI ---
import { AnswerBoxButton } from '../answer-box-button';
import type { UseAnswerBoxDropdownMenuConfig } from './useAnswerBoxDropdownMenu';
import { useAnswerBoxDropdownMenu } from './useAnswerBoxDropdownMenu';

// --- UI Primitives ---
import type { ButtonProps } from '../base';
import {
  Button,
  ButtonGroup,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Card,
  CardBody,
} from '../base';

export interface AnswerBoxDropdownMenuProps
  extends Omit<ButtonProps, 'type'>,
    UseAnswerBoxDropdownMenuConfig {
  /**
   * Whether to render the dropdown menu in a portal
   * @default false
   */
  portal?: boolean;
  /**
   * Callback for when the dropdown opens or closes
   */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Dropdown menu component for selecting heading levels in a Tiptap editor.
 *
 * For custom dropdown implementations, use the `useHeadingDropdownMenu` hook instead.
 */
export const AnswerBoxDropdownMenu = React.forwardRef<
  HTMLButtonElement,
  AnswerBoxDropdownMenuProps
>(
  (
    {
      editor: providedEditor,
      columnCounts = [1, 3, 5],
      hideWhenUnavailable = false,
      portal = false,
      onOpenChange,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor);
    const [isOpen, setIsOpen] = React.useState(false);
    const { isVisible, canInsert, Icon } = useAnswerBoxDropdownMenu({
      editor,
      columnCounts,
      hideWhenUnavailable,
    });

    const handleOnOpenChange = React.useCallback(
      (open: boolean) => {
        setIsOpen(open);
        onOpenChange?.(open);
      },
      [onOpenChange]
    );

    if (!isVisible || !editor || !editor.isEditable) {
      return null;
    }

    return (
      <DropdownMenu modal open={isOpen} onOpenChange={handleOnOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            type='button'
            data-style='ghost'
            data-active-state={'off'}
            role='button'
            tabIndex={-1}
            disabled={!canInsert}
            data-disabled={!canInsert}
            aria-label='정답 박스'
            tooltip='정답 박스'
            {...buttonProps}
            ref={ref}>
            <Icon className='tiptap-button-icon' />
            <ChevronDownIcon className='tiptap-button-dropdown-small' />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='start' portal={portal}>
          <Card style={{ backgroundColor: 'white' }}>
            <CardBody>
              <ButtonGroup>
                {columnCounts.map((columnCount) => (
                  <DropdownMenuItem key={`answer-box-${columnCount}`} asChild>
                    <AnswerBoxButton
                      editor={editor}
                      columnCount={columnCount}
                      text={`${columnCount}열`}
                      showTooltip={false}
                      showShortcut={true}
                    />
                  </DropdownMenuItem>
                ))}
              </ButtonGroup>
            </CardBody>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

AnswerBoxDropdownMenu.displayName = 'AnswerBoxDropdownMenu';

export default AnswerBoxDropdownMenu;
