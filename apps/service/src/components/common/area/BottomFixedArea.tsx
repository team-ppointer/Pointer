import React, { useMemo } from 'react';
import clsx from 'clsx';

import { getOs } from '@utils';
import { useIsOnScreenKeyboardOpen } from '@hooks';

import useViewport from './hooks/useViewport';

interface BottomFixedAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  containerStyle?: React.CSSProperties;
  zIndex?: number;
}

const detectIOS = getOs() === 'iOS';

export const BottomFixedArea = ({
  children,
  containerStyle,
  zIndex,
  ...rest
}: BottomFixedAreaProps) => {
  const viewport = useViewport();
  const isKeypadOpen = useIsOnScreenKeyboardOpen();

  const style = useMemo(() => {
    if (!detectIOS) {
      return undefined;
    }
    return {
      bottom: isKeypadOpen ? `${-viewport.offset}px` : `0px`,
    } as const;
  }, [isKeypadOpen, viewport.offset]);

  return (
    <div
      className={clsx(
        'pointer-events-none fixed bottom-0 left-1/2 box-border flex w-full max-w-[768px] -translate-x-1/2 flex-col transition-transform duration-200 ease-[cubic-bezier(0.1,0.76,0.55,0.9)]',
        zIndex ? `z-${zIndex}` : 'z-100'
      )}
      {...rest}
      style={{ ...style, ...containerStyle }}>
      <div className='pointer-events-auto'>{children}</div>
    </div>
  );
};
