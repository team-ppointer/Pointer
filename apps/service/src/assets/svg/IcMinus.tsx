import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcMinus = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M17.5 10.9997H7.5C6.94772 10.9997 6.5 11.4474 6.5 11.9997C6.5 12.552 6.94772 12.9997 7.5 12.9997H17.5C18.0523 12.9997 18.5 12.552 18.5 11.9997C18.5 11.4474 18.0523 10.9997 17.5 10.9997Z'
      fill='#C6CAD4'
    />
  </svg>
);
const Memo = memo(SvgIcMinus);
export default Memo;
