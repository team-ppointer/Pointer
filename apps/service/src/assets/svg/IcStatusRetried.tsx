import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcStatusRetried = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M6.73713 13.9982L10.7192 7.11714C11.5053 5.75881 13.4781 5.79371 14.2157 7.17899L17.8792 14.0601C18.5885 15.3923 17.623 17 16.1138 17H8.46816C6.92766 17 5.96553 15.3316 6.73713 13.9982Z'
      stroke='#E59C00'
      strokeWidth={2}
    />
  </svg>
);
const Memo = memo(SvgIcStatusRetried);
export default Memo;
