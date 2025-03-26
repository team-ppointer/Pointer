'use client';
import { useRouter } from 'next/navigation';

interface RouteModalProps {
  children: React.ReactNode;
}

const RouteModal = ({ children }: RouteModalProps) => {
  const router = useRouter();

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      onClick={() => router.back()}>
      <div className='h-full w-full bg-black opacity-50' />
      <div
        className='absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] transform overflow-auto rounded-[16px] bg-white shadow-lg'
        onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default RouteModal;
