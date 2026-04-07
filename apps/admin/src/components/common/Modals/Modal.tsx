import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const potalElement = document.getElementById('modal') as HTMLElement;

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className='animate-in fade-in fixed inset-0 z-50 flex items-center justify-center duration-200'
      onClick={onClose}>
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' />
      <div
        className='animate-in fade-in slide-in-from-bottom-4 relative max-h-[90vh] overflow-auto rounded-2xl border border-gray-200 bg-white shadow-xl duration-300'
        onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    potalElement
  );
};

export default Modal;
