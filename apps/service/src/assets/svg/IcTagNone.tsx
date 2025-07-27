import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcTagNone = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M10.7979 1.7998L1.19824 1.7998C0.756414 1.7998 0.398437 1.44183 0.398437 1C0.398437 0.558172 0.756414 0.200195 1.19824 0.200195L10.7979 0.200195C11.2397 0.200195 11.5986 0.558172 11.5986 0.999999C11.5986 1.44183 11.2397 1.7998 10.7979 1.7998Z'
      fill='#C6CAD4'
    />
  </svg>
);
const Memo = memo(SvgIcTagNone);
export default Memo;
