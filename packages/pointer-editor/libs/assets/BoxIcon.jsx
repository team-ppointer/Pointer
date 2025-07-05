import { memo } from 'react';

const SvgBox = ({ title, titleId, ...props }) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M10 4L4 4M10 6.25L4 6.25M1 3.25L1 10.75C1 11.9926 2.00736 13 3.25 13H10.75C11.9926 13 13 11.9926 13 10.75V3.25C13 2.00736 11.9926 1 10.75 1L3.25 1C2.00736 1 1 2.00736 1 3.25Z'
      stroke='#1E1E21'
      strokeWidth={1.33333}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
const Memo = memo(SvgBox);
export default Memo;
