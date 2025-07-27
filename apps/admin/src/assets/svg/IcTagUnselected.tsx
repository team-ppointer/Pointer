import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcTagUnselected = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M0.5 4C0.5 1.79086 2.29086 0 4.5 0H32.5C34.7091 0 36.5 1.79086 36.5 4V32C36.5 34.2091 34.7091 36 32.5 36H4.5C2.29086 36 0.5 34.2091 0.5 32V4Z'
      fill='#EDEEF2'
    />
  </svg>
);
const Memo = memo(SvgIcTagUnselected);
export default Memo;
