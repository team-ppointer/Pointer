import { memo } from 'react';

const SvgBold = ({ title, titleId, ...props }) => (
  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M4 0.5H20C21.933 0.5 23.5 2.067 23.5 4V20C23.5 21.933 21.933 23.5 20 23.5H4C2.067 23.5 0.5 21.933 0.5 20V4C0.5 2.067 2.067 0.5 4 0.5Z'
      fill='white'
    />
    <path
      d='M4 0.5H20C21.933 0.5 23.5 2.067 23.5 4V20C23.5 21.933 21.933 23.5 20 23.5H4C2.067 23.5 0.5 21.933 0.5 20V4C0.5 2.067 2.067 0.5 4 0.5Z'
      stroke='#C6CAD4'
    />
    <path
      d='M8 12.0003V17.3337H13.4C14.8359 17.3337 16 16.1398 16 14.667C16 13.1942 14.8359 12.0003 13.4 12.0003H8ZM8 12.0003H12.6C14.0359 12.0003 15.2 10.8064 15.2 9.33366C15.2 7.8609 14.0359 6.66699 12.6 6.66699H8V12.0003Z'
      stroke='#1E1E21'
      stroke-width='2'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
  </svg>
);
const Memo = memo(SvgBold);
export default Memo;
