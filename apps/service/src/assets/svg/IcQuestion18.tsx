import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcQuestion18 = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M8.99927 12.375V12.4047M7.3125 6.9225C7.3125 5.97291 8.06802 5.20312 9 5.20312C9.93198 5.20312 10.6875 5.97291 10.6875 6.9225C10.6875 7.87208 9.93198 8.64187 9 8.64187C9 8.64187 8.99927 9.15506 8.99927 9.78812M15.75 9C15.75 12.7279 12.7279 15.75 9 15.75C5.27208 15.75 2.25 12.7279 2.25 9C2.25 5.27208 5.27208 2.25 9 2.25C12.7279 2.25 15.75 5.27208 15.75 9Z'
      stroke='#617AF9'
      strokeWidth={1.5}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
const Memo = memo(SvgIcQuestion18);
export default Memo;
