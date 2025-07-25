import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcTagInprogress = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M6.28027 1.04616C6.58023 0.760486 7.04466 0.75298 7.35254 1.01686L7.41211 1.0735L11.5781 5.4485C11.8724 5.75746 11.8724 6.24305 11.5781 6.55201L7.41211 10.927L7.35254 10.9837C7.04466 11.2475 6.58023 11.24 6.28027 10.9544C5.96063 10.6496 5.94835 10.1433 6.25293 9.8235L9.13281 6.80006H0.999023C0.557196 6.80006 0.199219 6.44208 0.199219 6.00026C0.199219 5.55843 0.557196 5.20045 0.999023 5.20045H9.13281L6.25293 2.17701L6.19922 2.11451C5.95112 1.79426 5.98074 1.33171 6.28027 1.04616Z'
      fill='#0C9200'
    />
  </svg>
);
const Memo = memo(SvgIcTagInprogress);
export default Memo;
