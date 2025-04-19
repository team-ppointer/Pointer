'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const portalElement = typeof window !== 'undefined' && document.getElementById('modal');

const BottomSheet = ({ isOpen, onClose, children }: BottomSheetProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
          setShowBackdrop(true);
        });
      });
    } else if (shouldRender) {
      setIsAnimating(false);
      setShowBackdrop(false);

      const timeout = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = '';
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [isOpen, shouldRender]);

  if (!shouldRender || !portalElement) return null;

  return createPortal(
    <div className='fixed inset-0 z-40 flex items-center justify-center' onClick={onClose}>
      {showBackdrop && <div className='h-full w-full bg-black opacity-50' />}
      <div
        className={`absolute right-0 bottom-0 left-0 mx-auto w-full max-w-[768px] transform rounded-t-[24px] bg-white p-[2.4rem] pt-[3.2rem] shadow-lg transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    portalElement
  );
};

export default BottomSheet;
