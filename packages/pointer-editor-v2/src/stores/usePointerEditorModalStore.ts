import { create } from 'zustand';
import type { TiptapPayload } from '../editor';

export type ProblemEditorModalProps = {
  initialJSON?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  ocrApiCall?: ((data: any) => Promise<any>) | null; // eslint-disable-line @typescript-eslint/no-explicit-any
};

type PointerEditorModalStore = {
  isOpen: boolean;
  props: ProblemEditorModalProps;
  resolve?: (payload: TiptapPayload | null) => void;
  open: (props: ProblemEditorModalProps) => Promise<TiptapPayload | null>;
  close: (payload: TiptapPayload | null) => void;
};

export const usePointerEditorModalStore = create<PointerEditorModalStore>((set) => ({
  isOpen: false,
  props: {},
  resolve: undefined,
  open: (props) => {
    return new Promise((resolve) => {
      set({ isOpen: true, props, resolve });
    });
  },
  close: (payload) => {
    set((state) => {
      state.resolve?.(payload);
      return { isOpen: false, props: {}, resolve: undefined };
    });
  },
}));
