import { create } from 'zustand';

export type Note = {
  id: number;
  title: string;
};

type NoteStore = {
  openNotes: Note[];
  activeNoteId: number | null;

  openNote: (note: Note) => void;
  closeNote: (noteId: number) => void;
  closeNotesByScrapIds: (scrapIds: number[]) => void;
  setActiveNote: (noteId: number) => void;
  reorderNotes: (fromIndex: number, toIndex: number) => void;
  updateNoteTitle: (noteId: number, title: string) => void;
};

export const useNoteStore = create<NoteStore>((set, get) => ({
  openNotes: [],
  activeNoteId: null,

  openNote: (note) => {
    const { openNotes } = get();
    const exists = openNotes.find((n) => n.id === note.id);

    // 이미 열려 있으면 추가 X
    if (!exists) {
      set({
        openNotes: [...openNotes, note],
        activeNoteId: note.id,
      });
    } else {
      set({ activeNoteId: note.id });
    }
  },

  closeNote: (noteId) => {
    const { openNotes, activeNoteId } = get();
    const filtered = openNotes.filter((n) => n.id !== noteId);

    set({
      openNotes: filtered,
      activeNoteId:
        noteId === activeNoteId ? (filtered[filtered.length - 1]?.id ?? null) : activeNoteId,
    });
  },

  closeNotesByScrapIds: (scrapIds) => {
    const { openNotes, activeNoteId } = get();
    const scrapIdsSet = new Set(scrapIds);
    const filtered = openNotes.filter((n) => !scrapIdsSet.has(n.id));

    set({
      openNotes: filtered,
      activeNoteId:
        activeNoteId && scrapIdsSet.has(activeNoteId)
          ? (filtered[filtered.length - 1]?.id ?? null)
          : activeNoteId,
    });
  },

  setActiveNote: (noteId) => {
    set({ activeNoteId: noteId });
  },

  reorderNotes: (fromIndex, toIndex) => {
    const { openNotes } = get();
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= openNotes.length ||
      toIndex >= openNotes.length
    ) {
      return;
    }
    const newNotes = [...openNotes];
    const [moved] = newNotes.splice(fromIndex, 1);
    newNotes.splice(toIndex, 0, moved);
    set({ openNotes: newNotes });
  },

  updateNoteTitle: (noteId, title) => {
    const { openNotes } = get();
    const updatedNotes = openNotes.map((note) => (note.id === noteId ? { ...note, title } : note));
    set({ openNotes: updatedNotes });
  },
}));