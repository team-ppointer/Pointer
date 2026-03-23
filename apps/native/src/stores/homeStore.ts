import { create } from 'zustand';

type HomeState = {
  selectedMonth: Date;
  selectedDate: Date;
};

type HomeActions = {
  setSelectedMonth: (month: Date) => void;
  setSelectedDate: (date: Date) => void;
  resetSelection: () => void;
};

const getInitialDate = () => new Date();

const initialState: HomeState = {
  selectedMonth: getInitialDate(),
  selectedDate: getInitialDate(),
};

export const useHomeStore = create<HomeState & HomeActions>((set) => ({
  ...initialState,
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  resetSelection: () =>
    set({
      selectedMonth: getInitialDate(),
      selectedDate: getInitialDate(),
    }),
}));
