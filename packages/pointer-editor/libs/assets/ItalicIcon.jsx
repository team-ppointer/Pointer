import { memo } from 'react';

const SvgItalic = ({ title, titleId, ...props }) => (
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
      d='M11.0338 16.6663L13.6303 7.33301M11.0338 16.6663H8.33203M11.0338 16.6663H13.7355M13.6303 7.33301H10.9286M13.6303 7.33301H16.332'
      stroke='#1E1E21'
      stroke-width='1.33333'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
  </svg>
);
const Memo = memo(SvgItalic);
export default Memo;
