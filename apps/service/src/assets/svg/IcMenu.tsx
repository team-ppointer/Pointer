import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcMenu = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path d='M13.5 18H4M20 12H4M20 6H4' stroke='#617AF9' strokeWidth={2} strokeLinecap='round' />
  </svg>
);
const Memo = memo(SvgIcMenu);
export default Memo;
