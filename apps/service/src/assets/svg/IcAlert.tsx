import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcAlert = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M8 8.49997V5.49998M8 10.7236V10.75M14 4.74999L14 12.25C14 13.4926 12.9926 14.5 11.75 14.5H4.25C3.00736 14.5 2 13.4926 2 12.25V4.74999C2 3.50735 3.00736 2.5 4.25 2.5H11.75C12.9926 2.5 14 3.50735 14 4.74999Z'
      stroke='#D20000'
      strokeWidth={1.33333}
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);
const Memo = memo(SvgIcAlert);
export default Memo;
