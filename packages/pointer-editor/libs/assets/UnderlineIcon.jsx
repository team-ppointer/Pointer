import { memo } from 'react';

const SvgUnderline = ({ title, titleId, ...props }) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M13.3337 13.3337H2.66699M11.8098 3.4289V7.23842C11.8098 9.34236 10.1043 11.0479 8.00033 11.0479C5.89638 11.0479 4.1908 9.34236 4.1908 7.23842V3.4289M3.04794 2.66699H5.33366M10.667 2.66699L12.9527 2.66699'
      stroke='#1E1E21'
      strokeWidth={1.33333}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
const Memo = memo(SvgUnderline);
export default Memo;
