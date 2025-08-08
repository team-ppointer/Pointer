import clsx from 'clsx';
import { PropsWithChildren } from 'react';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({ isOpen, onClose, children }: PropsWithChildren<SidebarProps>) {
  return (
    <>
      {/* 오버레이: 모바일에서는 화면 전체, 데스크톱에서는 콘텐츠 영역에만 */}
      <div
        className={clsx(
          'fixed inset-0 z-290 bg-black/30 transition-opacity duration-300',
          {
            'visible opacity-100': isOpen,
            'invisible opacity-0': !isOpen,
          },
          'md:left-1/2 md:w-[768px] md:-translate-x-1/2 md:transform' // md 이상에서는 가운데 위치한 너비 제한된 오버레이
        )}
        onClick={onClose}
      />

      {/* 슬라이더 패널 */}
      <div
        className={clsx(
          'fixed top-0 left-0 z-300 h-dvh w-[85%] transform bg-white transition-transform duration-300 md:absolute md:top-0 md:left-0 md:h-full',
          {
            'translate-x-0': isOpen,
            '-translate-x-[100vw]': !isOpen,
          }
        )}>
        <div className='flex h-full w-full flex-col gap-[3.2rem] px-[2rem] pt-[2rem]'>
          {children}
        </div>
      </div>
    </>
  );
}
