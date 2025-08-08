'use client';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { PropsWithChildren } from 'react';

interface RouteModalProps {
  className?: string;
}

const RouteModal = ({ children, className }: PropsWithChildren<RouteModalProps>) => {
  const router = useRouter();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center`}
      onClick={() => router.back()}>
      <div className='h-full w-full bg-black opacity-50' />
      <div
        className={clsx(
          !className && [
            'absolute top-[50%] left-[50%] max-w-[768px]',
            'translate-x-[-50%] translate-y-[-50%]',
            'transform overflow-auto rounded-[16px] bg-white shadow-lg',
          ],
          className
        )}
        onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default RouteModal;
