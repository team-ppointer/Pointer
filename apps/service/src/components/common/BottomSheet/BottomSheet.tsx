'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const potalElement =
  typeof window !== 'undefined' && (document.getElementById('modal') as HTMLElement);

const BottomSheet = ({ isOpen, onClose, children = null }: BottomSheetProps) => {
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

  if (!isOpen || !potalElement) return null;

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center' onClick={onClose}>
      <div className='h-full w-full bg-black opacity-50' />
      <div
        className='absolute bottom-0 left-[50%] w-full max-w-[768px] translate-x-[-50%] transform rounded-t-[24px] bg-white p-[2.4rem] pt-[3.2rem] shadow-lg'
        onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    potalElement
  );
};

export default BottomSheet;
