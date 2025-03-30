'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const potalElement =
  typeof window !== 'undefined' && (document.getElementById('modal') as HTMLElement);

const PortalModal = ({ isOpen, onClose, children = null }: PortalModalProps) => {
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
        className='absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] transform overflow-auto rounded-[16px] bg-white shadow-lg'
        onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    potalElement
  );
};

export default PortalModal;
