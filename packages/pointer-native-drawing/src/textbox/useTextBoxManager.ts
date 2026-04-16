import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { HistoryManager } from '../engine/HistoryManager';

import type { TextBoxData } from './textBoxTypes';
import { createTextBox, hitTestTextBox } from './textBoxUtils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TextBoxActions = {
  handleTap: (canvasX: number, canvasY: number) => boolean;
  updateEditingText: (text: string) => void;
  updateEditingHeight: (height: number) => void;
  commitEditing: () => void;
  /**
   * Force-end any active TextBox session (editing, selection, drag).
   * Called on tool switch, clear, setStrokes, etc.
   */
  endSession: () => void;
  deleteSelected: () => void;
  deselect: () => void;
  editSelected: () => void;
  beginMove: () => void;
  updateMove: (canvasDx: number, canvasDy: number) => void;
  endMove: () => void;
  beginResize: () => void;
  updateResize: (canvasDx: number, side: 'left' | 'right') => void;
  endResize: () => void;
  applyHistoryEntry: (
    entry: {
      type: string;
      textBox?: TextBoxData;
      index?: number;
      before?: TextBoxData;
      after?: TextBoxData;
    },
    direction: 'undo' | 'redo'
  ) => void;
  setTextBoxes: (textBoxes: TextBoxData[]) => void;
  clearTextBoxes: () => void;
};

export type TextBoxManagerState = {
  textBoxes: TextBoxData[];
  editingId: string | null;
  selectedId: string | null;
  editingTextBox: TextBoxData | null;
  selectedTextBox: TextBoxData | null;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTextBoxManager(
  historyRef: React.RefObject<HistoryManager>,
  canvasSize: { width: number; height: number },
  onDirty?: () => void
): [TextBoxManagerState, TextBoxActions] {
  const onDirtyRef = useRef(onDirty);
  onDirtyRef.current = onDirty;
  const [textBoxes, setTextBoxes] = useState<TextBoxData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // --- Ref mirrors (avoids stale closures in callbacks) ---
  const textBoxesRef = useRef(textBoxes);
  useEffect(() => {
    textBoxesRef.current = textBoxes;
  }, [textBoxes]);

  const canvasSizeRef = useRef(canvasSize);
  canvasSizeRef.current = canvasSize;

  // Editing refs
  const editingTextRef = useRef<string>('');
  const editingHeightRef = useRef<number>(0);
  const isNewTextBoxRef = useRef(false);
  const editingBeforeRef = useRef<TextBoxData | null>(null);
  const editingIdRef = useRef<string | null>(null);

  // Selected ref — synchronized immediately (not via useEffect) to avoid stale reads
  const selectedIdRef = useRef<string | null>(null);

  /** Atomically update both ref and state to prevent stale closure reads. */
  const setSelectedIdSync = useCallback((id: string | null) => {
    selectedIdRef.current = id;
    setSelectedId(id);
  }, []);

  // Move/resize refs
  const dragBeforeRef = useRef<TextBoxData | null>(null);

  // Double-commit guard
  const commitInProgressRef = useRef(false);

  // Forward-ref for commitEditing (used by handleTap before commitEditing is declared)
  const commitEditingRef = useRef<() => void>(() => {});

  // -----------------------------------------------------------------------
  // Derived
  // -----------------------------------------------------------------------

  const editingTextBox = editingId ? (textBoxes.find((tb) => tb.id === editingId) ?? null) : null;

  const selectedTextBox = selectedId
    ? (textBoxes.find((tb) => tb.id === selectedId) ?? null)
    : null;

  // -----------------------------------------------------------------------
  // Start editing an existing TextBox
  // -----------------------------------------------------------------------

  const startEditing = useCallback(
    (id: string) => {
      const tb = textBoxesRef.current.find((t) => t.id === id);
      if (!tb) return;
      isNewTextBoxRef.current = false;
      editingBeforeRef.current = tb;
      editingTextRef.current = tb.text;
      editingHeightRef.current = tb.height;
      editingIdRef.current = id;
      setEditingId(id);
      setSelectedIdSync(id);
      historyRef.current?.lock();
    },
    [historyRef, setSelectedIdSync]
  );

  // -----------------------------------------------------------------------
  // Tap handler (textbox tool mode)
  // -----------------------------------------------------------------------

  const handleTap = useCallback(
    (canvasX: number, canvasY: number): boolean => {
      // If currently editing, commit first then continue with tap
      // (fixes blur→tap race where tap arrives before blur commits)
      if (commitInProgressRef.current) {
        return false;
      }
      if (editingIdRef.current) {
        commitEditingRef.current();
      }

      const tbs = textBoxesRef.current;
      const hitId = hitTestTextBox(canvasX, canvasY, tbs);

      if (hitId) {
        if (hitId === selectedIdRef.current) {
          startEditing(hitId);
        } else {
          setSelectedIdSync(hitId);
        }
        return true;
      }

      // Tap on empty space → create new TextBox (clamped to canvas bounds)
      const { width: cw } = canvasSizeRef.current;
      const rawTb = createTextBox(canvasX, canvasY);
      const clampedWidth = cw > 0 ? Math.min(rawTb.width, cw - rawTb.x) : rawTb.width;
      const clampedX = cw > 0 ? Math.min(rawTb.x, Math.max(0, cw - 60)) : rawTb.x;
      const newTb: TextBoxData = {
        ...rawTb,
        x: clampedX,
        width: Math.max(60, clampedWidth),
      };
      setSelectedIdSync(newTb.id);
      setTextBoxes((prev) => [...prev, newTb]);
      editingIdRef.current = newTb.id;
      setEditingId(newTb.id);
      isNewTextBoxRef.current = true;
      editingBeforeRef.current = null;
      editingTextRef.current = '';
      editingHeightRef.current = 0;

      historyRef.current?.lock();
      return true;
    },
    [historyRef, startEditing, setSelectedIdSync]
  );

  // -----------------------------------------------------------------------
  // Editing text
  // -----------------------------------------------------------------------

  const updateEditingText = useCallback(
    (text: string) => {
      editingTextRef.current = text;
      if (!editingId) return;
      setTextBoxes((prev) => prev.map((tb) => (tb.id === editingId ? { ...tb, text } : tb)));
    },
    [editingId]
  );

  const updateEditingHeight = useCallback(
    (height: number) => {
      editingHeightRef.current = height;
      if (!editingId) return;
      setTextBoxes((prev) => prev.map((tb) => (tb.id === editingId ? { ...tb, height } : tb)));
    },
    [editingId]
  );

  const commitEditing = useCallback(() => {
    // Check both state and ref — ref may have been cleared by an earlier inline commit
    if (!editingId || !editingIdRef.current) return;
    if (commitInProgressRef.current) return;
    commitInProgressRef.current = true;

    const text = editingTextRef.current.trim();
    const height = editingHeightRef.current;
    const isNew = isNewTextBoxRef.current;
    const before = editingBeforeRef.current;

    if (isNew) {
      if (text === '') {
        setTextBoxes((prev) => prev.filter((tb) => tb.id !== editingId));
      } else {
        const current = textBoxesRef.current.find((tb) => tb.id === editingId);
        if (current) {
          const finalTb: TextBoxData = { ...current, text, height };
          historyRef.current?.push({ type: 'add-textbox', textBox: finalTb });
          setTextBoxes((prev) => prev.map((tb) => (tb.id === editingId ? finalTb : tb)));
        }
      }
    } else if (before) {
      if (text === '') {
        setTextBoxes((prev) => prev.map((tb) => (tb.id === editingId ? before : tb)));
      } else if (text !== before.text) {
        const current = textBoxesRef.current.find((tb) => tb.id === editingId);
        if (current) {
          const finalTb: TextBoxData = { ...current, text, height };
          historyRef.current?.push({
            type: 'edit-textbox',
            before,
            after: finalTb,
          });
          setTextBoxes((prev) => prev.map((tb) => (tb.id === editingId ? finalTb : tb)));
        }
      }
    }

    editingIdRef.current = null;
    setEditingId(null);
    editingTextRef.current = '';
    editingHeightRef.current = 0;
    isNewTextBoxRef.current = false;
    editingBeforeRef.current = null;
    commitInProgressRef.current = false;

    historyRef.current?.unlock();
    onDirtyRef.current?.();
  }, [editingId, historyRef]);

  // Keep ref in sync so handleTap can call it before declaration order
  commitEditingRef.current = commitEditing;

  // -----------------------------------------------------------------------
  // End session — force-close editing/selection/drag
  // Called on tool switch, clear, setStrokes, etc.
  // -----------------------------------------------------------------------

  const endSession = useCallback(() => {
    // Auto-commit any active editing (tool switch = focus out)
    if (editingIdRef.current) {
      commitEditingRef.current();
    }

    // Cancel any active drag
    dragBeforeRef.current = null;

    // Clear selection
    setSelectedIdSync(null);
  }, [setSelectedIdSync]);

  // -----------------------------------------------------------------------
  // Delete
  // -----------------------------------------------------------------------

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    // If deleting the textbox currently being edited, clean up editing state first
    if (editingIdRef.current === selectedId) {
      editingIdRef.current = null;
      setEditingId(null);
      isNewTextBoxRef.current = false;
      editingBeforeRef.current = null;
      editingTextRef.current = '';
      editingHeightRef.current = 0;
      commitInProgressRef.current = false;
      historyRef.current?.unlock();
    }
    const currentTbs = textBoxesRef.current;
    const index = currentTbs.findIndex((tb) => tb.id === selectedId);
    if (index !== -1) {
      const deleted = currentTbs[index];
      historyRef.current?.push({
        type: 'delete-textbox',
        textBox: deleted,
        index,
      });
      setTextBoxes((prev) => prev.filter((tb) => tb.id !== selectedId));
      onDirtyRef.current?.();
    }
    setSelectedIdSync(null);
  }, [historyRef, selectedId]);

  const deselect = useCallback(() => {
    if (editingIdRef.current) commitEditingRef.current();
    setSelectedIdSync(null);
  }, [setSelectedIdSync]);

  // -----------------------------------------------------------------------
  // Move
  // -----------------------------------------------------------------------

  const beginMove = useCallback(() => {
    if (!selectedId) return;
    if (editingIdRef.current) commitEditingRef.current();
    const tb = textBoxesRef.current.find((t) => t.id === selectedId);
    if (tb) dragBeforeRef.current = tb;
  }, [selectedId]);

  const updateMove = useCallback(
    (canvasDx: number, canvasDy: number) => {
      if (!selectedId || !dragBeforeRef.current) return;
      const before = dragBeforeRef.current;
      const { width: cw, height: ch } = canvasSizeRef.current;
      let newX = before.x + canvasDx;
      let newY = before.y + canvasDy;
      if (cw > 0) {
        newX = Math.max(0, Math.min(newX, cw - before.width));
      }
      if (ch > 0) {
        const effectiveH = Math.max(before.height, before.fontSize * 1.5);
        newY = Math.max(0, Math.min(newY, ch - effectiveH));
      }
      setTextBoxes((prev) =>
        prev.map((tb) => (tb.id === selectedId ? { ...tb, x: newX, y: newY } : tb))
      );
    },
    [selectedId]
  );

  const endMove = useCallback(() => {
    if (!selectedId || !dragBeforeRef.current) return;
    const before = dragBeforeRef.current;
    dragBeforeRef.current = null;

    const after = textBoxesRef.current.find((t) => t.id === selectedId);
    if (after && (before.x !== after.x || before.y !== after.y)) {
      historyRef.current?.push({ type: 'move-textbox', before, after });
      onDirtyRef.current?.();
    }
  }, [historyRef, selectedId]);

  // -----------------------------------------------------------------------
  // Resize
  // -----------------------------------------------------------------------

  const beginResize = useCallback(() => {
    if (!selectedId) return;
    if (editingIdRef.current) commitEditingRef.current();
    const tb = textBoxesRef.current.find((t) => t.id === selectedId);
    if (tb) dragBeforeRef.current = tb;
  }, [selectedId]);

  const updateResize = useCallback(
    (canvasDx: number, side: 'left' | 'right') => {
      if (!selectedId || !dragBeforeRef.current) return;
      const before = dragBeforeRef.current;
      const minWidth = 60;
      const { width: cw } = canvasSizeRef.current;

      if (side === 'right') {
        let newWidth = Math.max(minWidth, before.width + canvasDx);
        if (cw > 0) {
          newWidth = Math.min(newWidth, cw - before.x);
        }
        setTextBoxes((prev) =>
          prev.map((tb) => (tb.id === selectedId ? { ...tb, width: newWidth } : tb))
        );
      } else {
        const delta = Math.min(canvasDx, before.width - minWidth);
        let newX = before.x + delta;
        let newWidth = before.width - delta;
        if (cw > 0) {
          newX = Math.max(0, newX);
          newWidth = before.x + before.width - newX;
          newWidth = Math.max(minWidth, newWidth);
        }
        setTextBoxes((prev) =>
          prev.map((tb) => (tb.id === selectedId ? { ...tb, x: newX, width: newWidth } : tb))
        );
      }
    },
    [selectedId]
  );

  const endResize = useCallback(() => {
    if (!selectedId || !dragBeforeRef.current) return;
    const before = dragBeforeRef.current;
    dragBeforeRef.current = null;

    const after = textBoxesRef.current.find((t) => t.id === selectedId);
    if (after && (before.width !== after.width || before.x !== after.x)) {
      historyRef.current?.push({ type: 'resize-textbox', before, after });
      onDirtyRef.current?.();
    }
  }, [historyRef, selectedId]);

  // -----------------------------------------------------------------------
  // History (undo/redo)
  // -----------------------------------------------------------------------

  const applyHistoryEntry = useCallback(
    (
      entry: {
        type: string;
        textBox?: TextBoxData;
        index?: number;
        before?: TextBoxData;
        after?: TextBoxData;
      },
      direction: 'undo' | 'redo'
    ) => {
      switch (entry.type) {
        case 'add-textbox': {
          if (direction === 'undo') {
            setTextBoxes((prev) => prev.filter((tb) => tb.id !== entry.textBox!.id));
          } else {
            setTextBoxes((prev) => [...prev, entry.textBox!]);
          }
          break;
        }
        case 'delete-textbox': {
          if (direction === 'undo') {
            const idx = entry.index ?? 0;
            setTextBoxes((prev) => {
              const next = [...prev];
              next.splice(idx, 0, entry.textBox!);
              return next;
            });
          } else {
            setTextBoxes((prev) => prev.filter((tb) => tb.id !== entry.textBox!.id));
          }
          break;
        }
        case 'edit-textbox':
        case 'resize-textbox':
        case 'move-textbox': {
          const target = direction === 'undo' ? entry.before! : entry.after!;
          setTextBoxes((prev) => prev.map((tb) => (tb.id === target.id ? target : tb)));
          break;
        }
      }
      // Cancel any active drag and clear selection
      dragBeforeRef.current = null;
      setSelectedIdSync(null);
      editingIdRef.current = null;
      setEditingId(null);
    },
    [setSelectedIdSync]
  );

  // -----------------------------------------------------------------------
  // External sync
  // -----------------------------------------------------------------------

  const setTextBoxesExternal = useCallback((next: TextBoxData[]) => {
    setTextBoxes(next);
    editingIdRef.current = null;
    setEditingId(null);
    setSelectedIdSync(null);
    dragBeforeRef.current = null;
  }, []);

  const clearTextBoxes = useCallback(() => {
    setTextBoxes([]);
    editingIdRef.current = null;
    setEditingId(null);
    setSelectedIdSync(null);
    dragBeforeRef.current = null;
  }, []);

  // -----------------------------------------------------------------------
  // Return
  // -----------------------------------------------------------------------

  const state: TextBoxManagerState = {
    textBoxes,
    editingId,
    selectedId,
    editingTextBox,
    selectedTextBox,
  };

  const editSelected = useCallback(() => {
    const id = selectedIdRef.current;
    if (id) startEditing(id);
  }, [startEditing]);

  const actions: TextBoxActions = useMemo(
    () => ({
      handleTap,
      updateEditingText,
      updateEditingHeight,
      commitEditing,
      endSession,
      deleteSelected,
      deselect,
      editSelected,
      beginMove,
      updateMove,
      endMove,
      beginResize,
      updateResize,
      endResize,
      applyHistoryEntry,
      setTextBoxes: setTextBoxesExternal,
      clearTextBoxes,
    }),
    [
      handleTap,
      updateEditingText,
      updateEditingHeight,
      commitEditing,
      endSession,
      deleteSelected,
      deselect,
      editSelected,
      beginMove,
      updateMove,
      endMove,
      beginResize,
      updateResize,
      endResize,
      applyHistoryEntry,
      setTextBoxesExternal,
      clearTextBoxes,
    ]
  );

  return [state, actions];
}
