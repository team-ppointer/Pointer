import { type Stroke, type StrokeBounds, type TextItem, type DocumentSnapshot } from '../model/drawingTypes';

// ---------------------------------------------------------------------------
// History entry types (stroke only — textbox entries added in MAT-359)
// ---------------------------------------------------------------------------

export type AppendStrokeEntry = {
  readonly type: 'append-stroke';
  readonly stroke: Stroke;
  readonly bounds: StrokeBounds;
  readonly snapshotBefore: DocumentSnapshot;
};

export type EraseStrokesEntry = {
  readonly type: 'erase-strokes';
  readonly snapshotBefore: DocumentSnapshot;
  readonly snapshotAfter: DocumentSnapshot;
  /** Cached SkPath[] from before the erase — used for O(1) undo. */
  readonly cachedPathsBefore?: readonly unknown[];
};

export type ReplaceDocumentEntry = {
  readonly type: 'replace-document';
  readonly snapshotBefore: DocumentSnapshot;
  readonly snapshotAfter: DocumentSnapshot;
  readonly textsBefore: readonly TextItem[];
  readonly textsAfter: readonly TextItem[];
};

export type HistoryEntry =
  | AppendStrokeEntry
  | EraseStrokesEntry
  | ReplaceDocumentEntry;

// ---------------------------------------------------------------------------
// State listener
// ---------------------------------------------------------------------------

export type HistoryStateListener = (state: { canUndo: boolean; canRedo: boolean }) => void;

// ---------------------------------------------------------------------------
// HistoryManager — command pattern
//
// append-stroke undo: O(1) — slice로 마지막 stroke 제거
// erase-strokes undo: snapshot 복원
// replace-document undo: snapshot + texts 복원
// ---------------------------------------------------------------------------

const DEFAULT_MAX_SIZE = 50;

export class HistoryManager {
  private stack: HistoryEntry[] = [];
  /** Points to the last pushed/applied entry (-1 = empty). */
  private pointer = -1;
  private readonly maxSize: number;
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
  // Listener
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
    if (this.pointer < this.stack.length - 1) {
      this.evictEntries(this.stack.slice(this.pointer + 1));
      this.stack.length = this.pointer + 1;
    }

    this.stack.push(entry);
    this.pointer = this.stack.length - 1;

    if (this.stack.length > this.maxSize) {
      const evicted = this.stack.shift()!;
      this.evictEntries([evicted]);
      this.pointer = this.stack.length - 1;
    }

    this.notifyListener();
  }

  // -----------------------------------------------------------------------
  // Undo / Redo — returns the entry for the caller to interpret
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

  beginTransaction(snapshotBefore: DocumentSnapshot, cachedPaths?: readonly unknown[]): void {
    this.discardTransaction();
    this.activeTransaction = { snapshotBefore, cachedPaths };
  }

  commitTransaction(snapshotAfter: DocumentSnapshot): void {
    if (!this.activeTransaction) return;
    const { snapshotBefore, cachedPaths } = this.activeTransaction;
    this.activeTransaction = null;

    if (snapshotBefore.strokes.length === snapshotAfter.strokes.length) return;

    this.push({
      type: 'erase-strokes',
      snapshotBefore,
      snapshotAfter,
      ...(cachedPaths ? { cachedPathsBefore: cachedPaths } : {}),
    });
  }

  discardTransaction(): void {
    if (this.activeTransaction?.cachedPaths) {
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
