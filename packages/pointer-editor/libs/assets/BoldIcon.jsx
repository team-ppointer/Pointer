import { memo } from 'react';

const SvgBold = ({ title, titleId, ...props }) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M1 7.00033V12.3337H6.4C7.83594 12.3337 9 11.1398 9 9.66699C9 8.19423 7.83594 7.00033 6.4 7.00033H1ZM1 7.00033H5.6C7.03594 7.00033 8.2 5.80642 8.2 4.33366C8.2 2.8609 7.03594 1.66699 5.6 1.66699H1V7.00033Z'
      stroke='#1E1E21'
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
const Memo = memo(SvgBold);
export default Memo;
