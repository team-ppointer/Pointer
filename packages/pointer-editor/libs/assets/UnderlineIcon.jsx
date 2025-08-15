import { memo } from 'react';

const UnderlineIcon = (props) => (
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
      d='M17.3346 17.3337H6.66797M15.8108 7.4289V11.2384C15.8108 13.3424 14.1052 15.0479 12.0013 15.0479C9.89736 15.0479 8.19178 13.3424 8.19178 11.2384V7.4289M7.04892 6.66699H9.33464M14.668 6.66699L16.9537 6.66699'
      stroke='#1E1E21'
      stroke-width='1.33333'
      stroke-linecap='round'
      stroke-linejoin='round'
    />
  </svg>
);

export default memo(UnderlineIcon);
