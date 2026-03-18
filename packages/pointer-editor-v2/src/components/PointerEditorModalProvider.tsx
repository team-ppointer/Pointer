import { usePointerEditorModalStore } from '../stores/usePointerEditorModalStore';
import { ProblemEditorModal } from '../components/ProblemEditorModal';
import type { TiptapPayload } from '../editor';
import { useRef, useState, useEffect } from 'react';

export const PointerEditorModalProvider = () => {
  const { isOpen, props, close } = usePointerEditorModalStore();
  const [isMounted, setIsMounted] = useState(false);
  const payloadRef = useRef<TiptapPayload | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
    }
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsMounted(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  const handleClose = () => {
    close(null); // Cancelled
  };

  const handleSave = () => {
    close(payloadRef.current); // Saved
  };

  const handleChange = (p: TiptapPayload) => {
    payloadRef.current = p;
  };

  return (
    <ProblemEditorModal
      {...props}
      isOpen={isOpen}
      onAnimationEnd={handleAnimationEnd}
      onChange={handleChange}
      onClose={handleClose}
      onSave={handleSave}
    />
  );
};
