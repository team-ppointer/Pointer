import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcMinusSmall = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M5.5918 3.68201H2.40998C2.23425 3.68201 2.0918 3.82446 2.0918 4.00019C2.0918 4.17592 2.23425 4.31837 2.40998 4.31837H5.5918C5.76752 4.31837 5.90998 4.17592 5.90998 4.00019C5.90998 3.82446 5.76752 3.68201 5.5918 3.68201Z'
      fill='#C6CAD4'
    />
  </svg>
);
const Memo = memo(SvgIcMinusSmall);
export default Memo;
