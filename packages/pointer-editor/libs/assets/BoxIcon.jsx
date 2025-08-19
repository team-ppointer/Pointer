import { memo } from 'react';

const SvgBox = ({ title, titleId, ...props }) => (
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
      d='M15 9L9 9M15 11.25L9 11.25M6 8.25L6 15.75C6 16.9926 7.00736 18 8.25 18H15.75C16.9926 18 18 16.9926 18 15.75V8.25C18 7.00736 16.9926 6 15.75 6L8.25 6C7.00736 6 6 7.00736 6 8.25Z'
      stroke='#1E1E21'
      stroke-width='1.33333'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
  </svg>
);
const Memo = memo(SvgBox);
export default Memo;
