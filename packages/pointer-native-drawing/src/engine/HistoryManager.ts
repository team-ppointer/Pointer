import type { Stroke, StrokeBounds } from "../model/drawingTypes";
import type { TextBoxData } from "../textbox/textBoxTypes";

// ---------------------------------------------------------------------------
// Document snapshot (lightweight — stores references, not deep copies)
// ---------------------------------------------------------------------------

export type DocumentSnapshot = {
  readonly strokes: readonly Stroke[];
  readonly bounds: readonly StrokeBounds[];
};

// ---------------------------------------------------------------------------
// History entry types
// ---------------------------------------------------------------------------

export type AppendStrokeEntry = {
  readonly type: "append-stroke";
  readonly stroke: Stroke;
  readonly bounds: StrokeBounds;
  /** Document state before this stroke was appended. */
  readonly snapshotBefore: DocumentSnapshot;
};

export type EraseStrokesEntry = {
  readonly type: "erase-strokes";
  readonly snapshotBefore: DocumentSnapshot;
  readonly snapshotAfter: DocumentSnapshot;
  /** Cached SkPath[] from before the erase — used for O(1) undo. */
  readonly cachedPathsBefore?: readonly unknown[];
};

export type ReplaceDocumentEntry = {
  readonly type: "replace-document";
  readonly snapshotBefore: DocumentSnapshot;
  readonly snapshotAfter: DocumentSnapshot;
};

export type AddTextBoxEntry = {
  readonly type: "add-textbox";
  readonly textBox: TextBoxData;
};

export type DeleteTextBoxEntry = {
  readonly type: "delete-textbox";
  readonly textBox: TextBoxData;
  readonly index: number;
};

export type EditTextBoxEntry = {
  readonly type: "edit-textbox";
  readonly before: TextBoxData;
  readonly after: TextBoxData;
};

export type ResizeTextBoxEntry = {
  readonly type: "resize-textbox";
  readonly before: TextBoxData;
  readonly after: TextBoxData;
};

export type MoveTextBoxEntry = {
  readonly type: "move-textbox";
  readonly before: TextBoxData;
  readonly after: TextBoxData;
};

export type HistoryEntry =
  | AppendStrokeEntry
  | EraseStrokesEntry
  | ReplaceDocumentEntry
  | AddTextBoxEntry
  | DeleteTextBoxEntry
  | EditTextBoxEntry
  | ResizeTextBoxEntry
  | MoveTextBoxEntry;

// ---------------------------------------------------------------------------
// State listener
// ---------------------------------------------------------------------------

export type HistoryStateListener = (state: {
  canUndo: boolean;
  canRedo: boolean;
}) => void;

// ---------------------------------------------------------------------------
// HistoryManager
// ---------------------------------------------------------------------------

const DEFAULT_MAX_SIZE = 50;

export class HistoryManager {
  private stack: HistoryEntry[] = [];
  /** Points to the last pushed/applied entry (-1 = empty). */
  private pointer = -1;
  private maxSize: number;
  private locked = false;
  private listener: HistoryStateListener | null = null;
  private onEntryEvicted: ((entry: HistoryEntry) => void) | null = null;
  private activeTransaction: {
    snapshotBefore: DocumentSnapshot;
    cachedPaths?: readonly unknown[];
  } | null = null;

  constructor(maxSize: number = DEFAULT_MAX_SIZE) {
    this.maxSize = maxSize;
  }

  // -----------------------------------------------------------------------
  // State listener
  // -----------------------------------------------------------------------

  setListener(listener: HistoryStateListener | null): void {
    this.listener = listener;
  }

  setOnEntryEvicted(cb: ((entry: HistoryEntry) => void) | null): void {
    this.onEntryEvicted = cb;
  }

  private notifyListener(): void {
    this.listener?.({ canUndo: this.canUndo(), canRedo: this.canRedo() });
  }

  private evictEntries(entries: HistoryEntry[]): void {
    if (!this.onEntryEvicted) return;
    for (const e of entries) this.onEntryEvicted(e);
  }

  // -----------------------------------------------------------------------
  // Push
  // -----------------------------------------------------------------------

  push(entry: HistoryEntry): void {
    // Truncate forward history (invalidated by new action)
    if (this.pointer < this.stack.length - 1) {
      this.evictEntries(this.stack.slice(this.pointer + 1));
      this.stack.length = this.pointer + 1;
    }

    this.stack.push(entry);
    this.pointer = this.stack.length - 1;

    // Evict oldest if over capacity
    if (this.stack.length > this.maxSize) {
      const evicted = this.stack.shift()!;
      this.evictEntries([evicted]);
      this.pointer = this.stack.length - 1;
    }

    this.notifyListener();
  }

  // -----------------------------------------------------------------------
  // Undo / Redo — returns the entry for the caller to interpret and apply
  // -----------------------------------------------------------------------

  undo(): HistoryEntry | null {
    if (!this.canUndo()) return null;
    const entry = this.stack[this.pointer];
    this.pointer--;
    this.notifyListener();
    return entry;
  }

  redo(): HistoryEntry | null {
    if (!this.canRedo()) return null;
    this.pointer++;
    const entry = this.stack[this.pointer];
    this.notifyListener();
    return entry;
  }

  // -----------------------------------------------------------------------
  // Query
  // -----------------------------------------------------------------------

  canUndo(): boolean {
    return !this.locked && this.pointer >= 0;
  }

  canRedo(): boolean {
    return !this.locked && this.pointer < this.stack.length - 1;
  }

  // -----------------------------------------------------------------------
  // Erase transaction
  // -----------------------------------------------------------------------

  /** Call at erase gesture start to capture the document state. */
  beginTransaction(snapshotBefore: DocumentSnapshot, cachedPaths?: readonly unknown[]): void {
    // Safety: discard any leaked transaction from a previous gesture
    this.discardTransaction();
    this.activeTransaction = { snapshotBefore, cachedPaths };
  }

  /**
   * Call at erase gesture end.
   * Only creates a history entry if strokes actually changed.
   */
  commitTransaction(snapshotAfter: DocumentSnapshot): void {
    if (!this.activeTransaction) return;
    const { snapshotBefore, cachedPaths } = this.activeTransaction;
    this.activeTransaction = null;

    // Erase only removes strokes — length equality implies no change.
    if (snapshotBefore.strokes.length === snapshotAfter.strokes.length) return;

    this.push({
      type: "erase-strokes",
      snapshotBefore,
      snapshotAfter,
      ...(cachedPaths ? { cachedPathsBefore: cachedPaths } : {}),
    });
  }

  discardTransaction(): void {
    if (this.activeTransaction?.cachedPaths) {
      // Evict cached paths from discarded transaction
      this.evictEntries([{
        type: 'erase-strokes',
        snapshotBefore: this.activeTransaction.snapshotBefore,
        snapshotAfter: this.activeTransaction.snapshotBefore,
        cachedPathsBefore: this.activeTransaction.cachedPaths,
      }]);
    }
    this.activeTransaction = null;
  }

  hasActiveTransaction(): boolean {
    return this.activeTransaction !== null;
  }

  // -----------------------------------------------------------------------
  // Lock (text editing blocks canvas undo/redo)
  //
  // When locked:
  //   - canUndo()/canRedo() return false → undo()/redo() are no-ops
  //   - push() is NOT blocked — the final commit can still record an entry
  //
  // Usage: lock() on editing start, push entry on commit, unlock() after.
  // Intermediate text changes during editing are local state, not pushed.
  // -----------------------------------------------------------------------

  lock(): void {
    this.locked = true;
    this.notifyListener();
  }

  unlock(): void {
    this.locked = false;
    this.notifyListener();
  }

  isLocked(): boolean {
    return this.locked;
  }

  // -----------------------------------------------------------------------
  // Clear
  // -----------------------------------------------------------------------

  clear(): void {
    this.evictEntries(this.stack);
    this.discardTransaction();
    this.stack = [];
    this.pointer = -1;
    this.locked = false;
    this.notifyListener();
  }
}
