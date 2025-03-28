import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcStatusNotStarted = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M17 10.9998H7C6.44772 10.9998 6 11.4475 6 11.9998C6 12.552 6.44772 12.9998 7 12.9998H17C17.5523 12.9998 18 12.552 18 11.9998C18 11.4475 17.5523 10.9998 17 10.9998Z'
      fill='#C6CAD4'
    />
  </svg>
);
const Memo = memo(SvgIcStatusNotStarted);
export default Memo;
