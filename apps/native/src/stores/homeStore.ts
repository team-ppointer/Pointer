import { create } from 'zustand';

type HomeState = {
  selectedMonth: Date;
  selectedDate: Date;
  selectedPublishId: number;
};

type HomeActions = {
  setSelectedMonth: (month: Date) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedPublishId: (publishId: number) => void;
  resetSelection: () => void;
};

const getInitialDate = () => new Date();

const initialState: HomeState = {
  selectedMonth: getInitialDate(),
  selectedDate: getInitialDate(),
  selectedPublishId: -1,
};

export const useHomeStore = create<HomeState & HomeActions>((set) => ({
  ...initialState,
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSelectedPublishId: (selectedPublishId) => set({ selectedPublishId }),
  resetSelection: () =>
    set({
      selectedMonth: getInitialDate(),
      selectedDate: getInitialDate(),
      selectedPublishId: -1,
    }),
}));
