import { memo } from 'react';

const SvgItalic = ({ title, titleId, ...props }) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M4.03475 10.6663L6.63127 1.33301M4.03475 10.6663H1.33301M4.03475 10.6663H6.73649M6.63127 1.33301H3.92953M6.63127 1.33301H9.33301'
      stroke='#1E1E21'
      strokeWidth={1.33333}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
const Memo = memo(SvgItalic);
export default Memo;
