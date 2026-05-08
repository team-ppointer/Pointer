import { type Stroke, type StrokeBounds, type DocumentSnapshot } from '../model/drawingTypes';

// ---------------------------------------------------------------------------
// History entry types
// ---------------------------------------------------------------------------

export type AppendStrokeEntry = {
  readonly type: 'append-stroke';
  readonly stroke: Stroke;
  readonly bounds: StrokeBounds;
};

export type EraseStrokesEntry = {
  readonly type: 'erase-strokes';
  readonly snapshotBefore: DocumentSnapshot;
  readonly snapshotAfter: DocumentSnapshot;
};

export type HistoryEntry = AppendStrokeEntry | EraseStrokesEntry;

export type HistoryStateListener = (state: { canUndo: boolean; canRedo: boolean }) => void;

// ---------------------------------------------------------------------------
// HistoryManager — command pattern
//
// append-stroke undo: O(1) — slice로 마지막 stroke 제거
// erase-strokes undo: snapshot 복원
// ---------------------------------------------------------------------------

const DEFAULT_MAX_SIZE = 50;

export class HistoryManager {
  private stack: HistoryEntry[] = [];
  /** Points to the last pushed/applied entry (-1 = empty). */
  private pointer = -1;
  private readonly maxSize: number;
  private listener: HistoryStateListener | null = null;
  private activeTransactionSnapshot: DocumentSnapshot | null = null;

  constructor(maxSize: number = DEFAULT_MAX_SIZE) {
    this.maxSize = maxSize;
  }

  setListener(listener: HistoryStateListener | null): void {
    this.listener = listener;
  }

  private notifyListener(): void {
    this.listener?.({ canUndo: this.canUndo(), canRedo: this.canRedo() });
  }

  push(entry: HistoryEntry): void {
    if (this.pointer < this.stack.length - 1) {
      this.stack.length = this.pointer + 1;
    }

    this.stack.push(entry);
    this.pointer = this.stack.length - 1;

    if (this.stack.length > this.maxSize) {
      this.stack.shift();
      this.pointer = this.stack.length - 1;
    }

    this.notifyListener();
  }

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

  canUndo(): boolean {
    return this.pointer >= 0;
  }

  canRedo(): boolean {
    return this.pointer < this.stack.length - 1;
  }

  // -----------------------------------------------------------------------
  // Erase transaction
  // -----------------------------------------------------------------------

  beginTransaction(snapshotBefore: DocumentSnapshot): void {
    this.activeTransactionSnapshot = snapshotBefore;
  }

  commitTransaction(snapshotAfter: DocumentSnapshot): void {
    if (!this.activeTransactionSnapshot) return;
    const snapshotBefore = this.activeTransactionSnapshot;
    this.activeTransactionSnapshot = null;

    if (snapshotBefore.strokes.length === snapshotAfter.strokes.length) return;

    this.push({
      type: 'erase-strokes',
      snapshotBefore,
      snapshotAfter,
    });
  }

  discardTransaction(): void {
    this.activeTransactionSnapshot = null;
  }

  hasActiveTransaction(): boolean {
    return this.activeTransactionSnapshot !== null;
  }

  clear(): void {
    this.discardTransaction();
    this.stack = [];
    this.pointer = -1;
    this.notifyListener();
  }
}
