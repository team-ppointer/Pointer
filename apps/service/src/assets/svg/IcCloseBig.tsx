import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcCloseBig = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path d='M18 6L6 18M18 18L6 6' stroke='#1E1E21' strokeWidth={2} strokeLinecap='round' />
  </svg>
);
const Memo = memo(SvgIcCloseBig);
export default Memo;
