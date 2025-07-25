import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcTagDone = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M10.2316 0.835147C10.5432 0.522292 11.0493 0.520885 11.3625 0.832217C11.6758 1.14375 11.677 1.65075 11.3654 1.96405L4.20624 9.16327C4.05608 9.31428 3.85181 9.3996 3.63886 9.3996C3.42592 9.39959 3.22162 9.31427 3.07147 9.16327L0.631045 6.70917L1.76581 5.58124L3.63886 7.46405L10.2316 0.835147ZM0.633974 5.57831C0.947273 5.26677 1.45427 5.26794 1.76581 5.58124L0.631045 6.70917C0.319784 6.39596 0.32105 5.88982 0.633974 5.57831Z'
      fill='#3A67EE'
    />
  </svg>
);
const Memo = memo(SvgIcTagDone);
export default Memo;
