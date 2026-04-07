import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcTagCheck16 = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M6.33282 9.77329L2.41382 5.8543C2.22629 5.66682 1.97198 5.56151 1.70682 5.56151C1.44165 5.56151 1.18735 5.66682 0.999818 5.8543C0.812347 6.04182 0.707031 6.29613 0.707031 6.56129C0.707031 6.82646 0.812347 7.08077 0.999818 7.26829L4.91882 11.1873C5.10455 11.3731 5.32506 11.5205 5.56776 11.621C5.81047 11.7216 6.07061 11.7734 6.33332 11.7734C6.59603 11.7734 6.85617 11.7216 7.09887 11.621C7.34158 11.5205 7.56209 11.3731 7.74782 11.1873L16.9998 1.9353C17.1873 1.74777 17.2926 1.49346 17.2926 1.2283C17.2926 0.963137 17.1873 0.708829 16.9998 0.521301C16.8123 0.333831 16.558 0.228516 16.2928 0.228516C16.0277 0.228516 15.7733 0.333831 15.5858 0.521301L6.33282 9.77329Z'
      fill='#3E3F45'
    />
  </svg>
);
const Memo = memo(SvgIcTagCheck16);
export default Memo;
