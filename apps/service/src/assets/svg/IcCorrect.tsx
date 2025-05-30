import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcCorrect = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <g clipPath='url(#clip0_2982_36483)'>
      <path
        d='M24.5 0C19.7533 0 15.1131 1.40758 11.1663 4.04473C7.21954 6.68188 4.14341 10.4302 2.3269 14.8156C0.510399 19.201 0.0351188 24.0266 0.961164 28.6822C1.88721 33.3377 4.17299 37.6141 7.52945 40.9706C10.8859 44.327 15.1623 46.6128 19.8178 47.5388C24.4734 48.4649 29.299 47.9896 33.6844 46.1731C38.0698 44.3566 41.8181 41.2805 44.4553 37.3337C47.0924 33.3869 48.5 28.7468 48.5 24C48.5 17.6348 45.9714 11.5303 41.4706 7.02944C36.9697 2.52856 30.8652 0 24.5 0V0ZM24.5 44C20.5444 44 16.6776 42.827 13.3886 40.6294C10.0996 38.4318 7.53617 35.3082 6.02242 31.6537C4.50867 27.9992 4.1126 23.9778 4.88431 20.0982C5.65601 16.2186 7.56082 12.6549 10.3579 9.85787C13.1549 7.06081 16.7186 5.156 20.5982 4.38429C24.4778 3.61259 28.4992 4.00866 32.1537 5.52241C35.8082 7.03616 38.9318 9.59961 41.1294 12.8886C43.327 16.1776 44.5 20.0444 44.5 24C44.5 29.3043 42.3929 34.3914 38.6421 38.1421C34.8914 41.8929 29.8043 44 24.5 44Z'
        fill='#0C9200'
      />
    </g>
    <defs>
      <clipPath id='clip0_2982_36483'>
        <rect width={48} height={48} fill='white' transform='translate(0.5)' />
      </clipPath>
    </defs>
  </svg>
);
const Memo = memo(SvgIcCorrect);
export default Memo;
