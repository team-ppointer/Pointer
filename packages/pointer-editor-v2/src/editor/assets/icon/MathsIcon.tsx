import * as React from 'react';

export const MathsIcon = React.memo(({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      {...props}>
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M19 5h-7l-4 14l-3 -6h-2' />
      <path d='M14 13l6 6' />
      <path d='M14 19l6 -6' />
    </svg>
  );
});

MathsIcon.displayName = 'MathsIcon';
