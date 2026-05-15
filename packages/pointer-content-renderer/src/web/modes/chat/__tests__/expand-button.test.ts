/// <reference types="vitest/globals" />
import { describe, expect, it, vi } from 'vitest';

import type { JSONNode } from '../../../../types';
import { createExpandButton } from '../chat-renderer';

const NODE: JSONNode = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }],
};

describe('createExpandButton', () => {
  it('defaultExpanded:true → renders pre-opened with disabled button and does not fire onOpen', () => {
    const onOpen = vi.fn();
    const { btn, content } = createExpandButton(NODE, {
      nodeId: 'b1',
      defaultExpanded: true,
      onOpen,
    });

    expect(btn.disabled).toBe(true);
    expect(content.classList.contains('chat-expand-content--visible')).toBe(true);
    expect(content.style.height).toBe('auto');
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('first click fires onOpen(nodeId) once, adds visible class, and disables button', () => {
    const onOpen = vi.fn();
    const { btn, content } = createExpandButton(NODE, { nodeId: 'b2', onOpen });

    expect(btn.disabled).toBe(false);
    expect(content.classList.contains('chat-expand-content--visible')).toBe(false);

    btn.click();

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith('b2');
    expect(content.classList.contains('chat-expand-content--visible')).toBe(true);
    expect(btn.disabled).toBe(true);
  });

  it('second programmatic click after first does not fire onOpen again ({once: true})', () => {
    const onOpen = vi.fn();
    const { btn } = createExpandButton(NODE, { nodeId: 'b3', onOpen });

    btn.click();
    btn.click();
    btn.click();

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('without nodeId → click does not fire onOpen (legacy commentContent-derived bubbles)', () => {
    const onOpen = vi.fn();
    const { btn, content } = createExpandButton(NODE, { onOpen });

    btn.click();

    expect(onOpen).not.toHaveBeenCalled();
    // Renderer still opens the bubble visually — only the bridge fire is gated on nodeId.
    expect(content.classList.contains('chat-expand-content--visible')).toBe(true);
    expect(btn.disabled).toBe(true);
  });
});
