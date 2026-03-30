'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import type { Editor } from '@tiptap/react';
import { posToDOMRect } from '@tiptap/core';
import { computePosition, offset, flip, shift } from '@floating-ui/dom';

import { Button, ButtonGroup, Card, CardBody } from '../base';
import { CloseIcon, CornerDownLeftIcon } from '../../assets';

import './mathfield.scss';

export interface MathInlinePopoverProps {
  editor?: Editor | null;
  /** Whether the popover is open */
  open: boolean;
  /** Initial/controlled LaTeX */
  latex: string;
  /**
   * Editor document position for the inline math node.
   * When provided with `editor`, the popover will compute its own rect from (pos, pos+nodeSize).
   */
  pos?: number | null;
  /** (Deprecated) External anchor rect. If provided and no editor/pos, it will be used as a fallback. */
  anchorRect?: DOMRect | null;
  /** Container element to portal the popover into (defaults to document.body) */
  container?: HTMLElement | null;
  /** Min width for the mathfield (e.g., 200, '16rem'). Numbers are treated as px. */
  minWidth?: number | string;
  /** Visual variant for the math editor */
  variant?: 'floating' | 'toolbar';
  /** Called when popover should close */
  onOpenChange: (open: boolean) => void;
  /** Called with saved latex */
  onSave: (latex: string) => void;
  /** Called on every input with the current latex for live preview */
  onPreview?: (latex: string) => void;
}

/**
 * Renders a floating math editor (mathlive) in a popover, positioned relative to the provided
 * anchor rect or editor+pos. The component lazy-loads mathlive and mounts a MathfieldElement.
 */
export const MathInlinePopover: React.FC<MathInlinePopoverProps> = ({
  editor,
  open,
  latex,
  pos,
  anchorRect,
  container,
  minWidth,
  variant = 'floating',
  onOpenChange,
  onSave,
  onPreview,
}) => {
  const [value, setValue] = React.useState(latex);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mathfieldRef = React.useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  const isFloating = variant !== 'toolbar';
  const toolbarRef = React.useRef<HTMLDivElement | null>(null);
  const floatingRef = React.useRef<HTMLDivElement | null>(null);
  const [floatingStyle, setFloatingStyle] = React.useState<React.CSSProperties>({
    position: 'fixed',
    left: -9999,
    top: -9999,
    zIndex: 1000,
    visibility: 'hidden',
  });

  React.useEffect(() => {
    setValue(latex);
  }, [latex, open]);

  const minWidthCss = React.useMemo(() => {
    if (typeof minWidth === 'number') return `${minWidth}px`;
    if (typeof minWidth === 'string' && minWidth.trim()) return minWidth;
    return '250px';
  }, [minWidth]);

  const positionNow = React.useCallback(async () => {
    if (!open || !isFloating) return;

    const computeVirtualRect = (): DOMRect | null => {
      try {
        if (editor && typeof pos === 'number') {
          const nodeAt = editor.state.doc.nodeAt(pos) as any | null; // eslint-disable-line @typescript-eslint/no-explicit-any
          const nodeSize = nodeAt?.nodeSize ?? 1;
          const from = pos;
          const to = pos + nodeSize;
          const rect = posToDOMRect(editor.view, from, to);
          if (rect && (rect.width > 0 || rect.height > 0)) return rect;
          // fallback using coordsAtPos when rect is degenerate
          const start = editor.view.coordsAtPos(from);
          const end = editor.view.coordsAtPos(to);
          const left = Math.min(start.left, end.left);
          const right = Math.max(start.right ?? end.left, end.right ?? start.left);
          const top = Math.min(start.top, end.top);
          const bottom = Math.max(start.bottom ?? end.top, end.bottom ?? start.top);
          return new DOMRect(left, top, Math.max(1, right - left), Math.max(1, bottom - top));
        }
      } catch {
        // ignore and try other fallbacks
      }
      // fallback to deprecated external anchorRect if provided
      if (anchorRect) return anchorRect;
      return null;
    };

    const rect = computeVirtualRect();

    if (!rect || !floatingRef.current) {
      // Fallback center position when ref/rect not ready
      setFloatingStyle({
        position: 'fixed',
        left: window.innerWidth / 2,
        top: window.innerHeight * 0.2,
        transform: 'translate(-50%, 0)',
        zIndex: 1000,
        visibility: 'visible',
      });
      return;
    }

    const virtualEl = {
      getBoundingClientRect: () => rect,
      getClientRects: () => [rect] as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    const strategy = 'fixed';
    try {
      const { x, y } = await computePosition(virtualEl, floatingRef.current, {
        placement: 'top',
        strategy,
        middleware: [offset(8), flip(), shift()],
      });
      setFloatingStyle({
        position: strategy,
        left: Math.round(x),
        top: Math.round(y),
        zIndex: 1000,
        visibility: 'visible',
      });
    } catch {
      setFloatingStyle({
        position: 'fixed',
        left: Math.round(rect.left),
        top: Math.round(rect.top) - 8,
        zIndex: 1000,
        visibility: 'visible',
      });
    }
  }, [open, editor, pos, anchorRect, isFloating]);

  const handleSave = React.useCallback(() => {
    const mf = mathfieldRef.current;
    const next = typeof mf?.getValue === 'function' ? mf.getValue('latex') : value;
    onSave(next);
    onOpenChange(false);
  }, [onSave, onOpenChange, value]);

  const handleSaveRef = React.useRef(handleSave);
  handleSaveRef.current = handleSave;
  const positionNowRef = React.useRef(positionNow);
  positionNowRef.current = positionNow;
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const onPreviewRef = React.useRef(onPreview);
  onPreviewRef.current = onPreview;
  const onOpenChangeRef = React.useRef(onOpenChange);
  onOpenChangeRef.current = onOpenChange;

  React.useEffect(() => {
    if (!open) return;
    let destroyed = false;
    let ro: ResizeObserver | null = null;
    let previewRafId: number | null = null;
    let lastPreviewLatex: string | null = null;

    const onInput = () => {
      try {
        const mf = mathfieldRef.current;
        if (!mf || typeof mf.getValue !== 'function') return;
        const nextLatex = mf.getValue('latex');
        if (nextLatex === lastPreviewLatex) return;
        lastPreviewLatex = nextLatex;
        if (previewRafId !== null) cancelAnimationFrame(previewRafId);
        previewRafId = requestAnimationFrame(() => {
          previewRafId = null;
          onPreviewRef.current?.(nextLatex);
        });
      } catch {
        // ignore
      }
    };

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' && !ev.shiftKey && !ev.altKey && !ev.ctrlKey && !ev.metaKey) {
        if (ev.defaultPrevented) return;
        ev.preventDefault();
        ev.stopPropagation();
        try {
          requestAnimationFrame(() => {
            handleSaveRef.current();
          });
        } catch {
          handleSaveRef.current();
        }
      }
      if (ev.key === 'Escape') {
        ev.preventDefault();
        ev.stopPropagation();
        onOpenChangeRef.current(false);
        return;
      }
      if (ev.key === 'k' && (ev.metaKey || ev.ctrlKey) && !ev.shiftKey && !ev.altKey) {
        ev.preventDefault();
        ev.stopPropagation();
        const vk = window.mathVirtualKeyboard;
        if (vk) {
          if (vk.visible) vk.hide({ animate: true });
          else vk.show({ animate: true });
        }
      }
    };

    async function mount() {
      const { MathfieldElement } = await import('mathlive');
      if (destroyed) return;
      if (!containerRef.current) return;

      const mf = new MathfieldElement({});
      try {
        (mf as HTMLElement).style.minWidth = minWidthCss;
      } catch {
        // ignore
      }
      mf.value = valueRef.current;
      mathfieldRef.current = mf;
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(mf);
      mf.focus();

      mf.addEventListener('input', onInput);
      mf.addEventListener('keydown', onKeyDown);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!destroyed) positionNowRef.current();
        });
      });

      if (typeof ResizeObserver !== 'undefined') {
        const target = floatingRef.current ?? containerRef.current;
        if (target) {
          ro = new ResizeObserver(() => {
            if (!destroyed && open) {
              requestAnimationFrame(() => positionNowRef.current());
            }
          });
          ro.observe(target);
        }
      }
    }

    mount();
    return () => {
      destroyed = true;
      if (previewRafId !== null) {
        cancelAnimationFrame(previewRafId);
        previewRafId = null;
      }
      try {
        if (ro) {
          ro.disconnect();
          ro = null;
        }
        const mf = mathfieldRef.current;
        try {
          if (mf && typeof mf.removeEventListener === 'function') {
            mf.removeEventListener('input', onInput);
            mf.removeEventListener('keydown', onKeyDown);
          }
        } catch {
          // ignore
        }
        if (mf?.remove) mf.remove();
      } catch {
        // Cleanup failed, ignore
      }
      mathfieldRef.current = null;
    };
  }, [open, minWidthCss]);

  const handleCancel = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const isInMathliveUI = React.useCallback((target: EventTarget | null): boolean => {
    const el = target as HTMLElement | null;
    if (!el) return false;
    if (
      el.closest(
        '.ML__keyboard, .ML__VK, [data-ml-keyboard], [data-mathlive-virtual-keyboard], [aria-label="MathLive Virtual Keyboard"], #mathlive-suggestion-popover'
      )
    )
      return true;
    return false;
  }, []);

  const setFloatingRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      floatingRef.current = el;
      if (!isFloating) return;
      if (open && el) {
        // Run after the portal commit on the next frame
        requestAnimationFrame(() => {
          positionNow();
        });
      }
    },
    [open, positionNow, isFloating]
  );

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const popoverEl = isFloating ? floatingRef.current : toolbarRef.current;
      if (popoverEl?.contains(target)) return;
      if (isInMathliveUI(target)) return;
      onOpenChange(false);
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [open, isFloating, isInMathliveUI, onOpenChange]);

  React.useLayoutEffect(() => {
    if (!isFloating) return;
    if (!open) {
      setFloatingStyle((s) => ({ ...s, visibility: 'hidden' }));
      return;
    }
    if (floatingRef.current) {
      // In case dependencies change while already mounted
      requestAnimationFrame(() => {
        positionNow();
      });
    }
  }, [open, editor, pos, anchorRect, positionNow, isFloating]);

  // Follow scrolling/resize by re-computing the position
  React.useEffect(() => {
    if (!open || !isFloating) return;

    let ticking = false;
    const schedule = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        positionNow();
      });
    };

    // Use capture to catch scrolls from any scrollable ancestor (including within portals/iframes)
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);

    // Also attach to the editor's document/window if different
    const doc = editor?.view?.dom?.ownerDocument ?? document;
    const rootWin = doc?.defaultView ?? window;
    if (rootWin && rootWin !== window) {
      rootWin.addEventListener('scroll', schedule, true);
      rootWin.addEventListener('resize', schedule);
    }

    return () => {
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      if (rootWin && rootWin !== window) {
        rootWin.removeEventListener('scroll', schedule, true);
        rootWin.removeEventListener('resize', schedule);
      }
    };
  }, [open, editor, positionNow, isFloating]);

  const renderContent = React.useCallback(() => {
    return (
      <div className='math-inline-content'>
        <div ref={containerRef} className='math-inline-field' style={{ minWidth: minWidthCss }} />
        <ButtonGroup orientation='horizontal' className='math-inline-actions'>
          <Button type='button' data-style='ghost' title='Cancel' onClick={handleCancel}>
            <CloseIcon className='tiptap-button-icon' />
          </Button>
          <Button type='button' title='Save' onClick={handleSave}>
            <CornerDownLeftIcon className='tiptap-button-icon' />
          </Button>
        </ButtonGroup>
      </div>
    );
  }, [handleCancel, handleSave, minWidthCss]);

  if (!isFloating) {
    if (!open) return null;
    return (
      <div className='math-inline-bar' ref={toolbarRef}>
        <div className='math-inline-bar__inner'>{renderContent()}</div>
      </div>
    );
  }

  if (!open) return null;
  const portalTarget = container || (typeof document !== 'undefined' ? document.body : null);
  if (!portalTarget) return null;
  return createPortal(
    <div ref={setFloatingRef} className='math-inline-floating' style={floatingStyle}>
      <Card>
        <CardBody>{renderContent()}</CardBody>
      </Card>
    </div>,
    portalTarget
  );
};

export default MathInlinePopover;
