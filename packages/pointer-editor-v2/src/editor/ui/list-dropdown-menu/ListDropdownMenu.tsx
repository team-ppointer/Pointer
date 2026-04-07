import * as React from 'react';
import { type Editor } from '@tiptap/react';

// --- Hooks ---
import { useTiptapEditor } from '../../hooks';

// --- Icons ---
import { ChevronDownIcon } from '../../assets';

// --- Tiptap UI ---
import { ListButton, type ListType } from '../list-button';

import { useListDropdownMenu } from './useListDropdownMenu';

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

export interface ListDropdownMenuProps extends Omit<ButtonProps, 'type'> {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor;
  /**
   * The list types to display in the dropdown.
   */
  types?: ListType[];
  /**
   * Whether the dropdown should be hidden when no list types are available
   * @default false
   */
  hideWhenUnavailable?: boolean;
  /**
   * Callback for when the dropdown opens or closes
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Whether to render the dropdown menu in a portal
   * @default false
   */
  portal?: boolean;
}

export function ListDropdownMenu({
  editor: providedEditor,
  types = ['bulletList', 'orderedList', 'hangulList'],
  hideWhenUnavailable = false,
  onOpenChange,
  portal = false,
  ...props
}: ListDropdownMenuProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = React.useState(false);

  const { filteredLists, canToggle, isActive, isVisible, Icon } = useListDropdownMenu({
    editor,
    types,
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
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          data-style='ghost'
          data-active-state={isActive ? 'on' : 'off'}
          role='button'
          tabIndex={-1}
          disabled={!canToggle}
          data-disabled={!canToggle}
          aria-label='목록 옵션'
          tooltip='목록'
          {...props}>
          <Icon className='tiptap-button-icon' />
          <ChevronDownIcon className='tiptap-button-dropdown-small' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='start' portal={portal}>
        <Card style={{ backgroundColor: 'white' }}>
          <CardBody>
            <ButtonGroup>
              {filteredLists.map((option) => (
                <DropdownMenuItem key={option.type} asChild>
                  <ListButton
                    editor={editor}
                    type={option.type}
                    text={option.label}
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

export default ListDropdownMenu;
