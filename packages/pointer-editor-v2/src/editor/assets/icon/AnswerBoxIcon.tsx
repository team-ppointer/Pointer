import * as React from 'react';

export const AnswerBoxIcon = React.memo(
  ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
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
        <path d='M4 4l0 .01' />
        <path d='M8 4l0 .01' />
        <path d='M12 4l0 .01' />
        <path d='M16 4l0 .01' />
        <path d='M20 4l0 .01' />
        <path d='M4 8l0 .01' />
        <path d='M12 8l0 .01' />
        <path d='M20 8l0 .01' />
        <path d='M4 12l0 .01' />
        <path d='M8 12l0 .01' />
        <path d='M12 12l0 .01' />
        <path d='M16 12l0 .01' />
        <path d='M20 12l0 .01' />
        <path d='M4 16l0 .01' />
        <path d='M12 16l0 .01' />
        <path d='M20 16l0 .01' />
        <path d='M4 20l0 .01' />
        <path d='M8 20l0 .01' />
        <path d='M12 20l0 .01' />
        <path d='M16 20l0 .01' />
        <path d='M20 20l0 .01' />
      </svg>
    );
  }
);

AnswerBoxIcon.displayName = 'AnswerBoxIcon';
