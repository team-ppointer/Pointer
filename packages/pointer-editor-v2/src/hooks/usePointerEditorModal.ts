import { usePointerEditorModalStore } from '../stores/usePointerEditorModalStore';

export const usePointerEditorModal = () => {
  const { open } = usePointerEditorModalStore.getState();
  return { open };
};
