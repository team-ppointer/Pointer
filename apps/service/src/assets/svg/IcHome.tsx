import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcHome = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <g clipPath='url(#clip0_3207_9846)'>
      <path
        d='M23.121 9.06893L15.536 1.48293C14.5973 0.546917 13.3257 0.0213013 12 0.0213013C10.6744 0.0213013 9.40277 0.546917 8.46401 1.48293L0.879012 9.06893C0.599438 9.34671 0.377782 9.67723 0.226895 10.0413C0.0760072 10.4054 -0.0011104 10.7958 1.20795e-05 11.1899V21.0069C1.20795e-05 21.8026 0.316083 22.5656 0.878692 23.1282C1.4413 23.6909 2.20436 24.0069 3.00001 24.0069H21C21.7957 24.0069 22.5587 23.6909 23.1213 23.1282C23.6839 22.5656 24 21.8026 24 21.0069V11.1899C24.0011 10.7958 23.924 10.4054 23.7731 10.0413C23.6222 9.67723 23.4006 9.34671 23.121 9.06893ZM15 22.0069H9.00001V18.0729C9.00001 17.2773 9.31608 16.5142 9.87869 15.9516C10.4413 15.389 11.2044 15.0729 12 15.0729C12.7957 15.0729 13.5587 15.389 14.1213 15.9516C14.6839 16.5142 15 17.2773 15 18.0729V22.0069ZM22 21.0069C22 21.2721 21.8947 21.5265 21.7071 21.714C21.5196 21.9016 21.2652 22.0069 21 22.0069H17V18.0729C17 16.7468 16.4732 15.4751 15.5355 14.5374C14.5979 13.5997 13.3261 13.0729 12 13.0729C10.6739 13.0729 9.40216 13.5997 8.46448 14.5374C7.5268 15.4751 7.00001 16.7468 7.00001 18.0729V22.0069H3.00001C2.7348 22.0069 2.48044 21.9016 2.29291 21.714C2.10537 21.5265 2.00001 21.2721 2.00001 21.0069V11.1899C2.00094 10.9249 2.1062 10.6709 2.29301 10.4829L9.87801 2.89993C10.4417 2.33886 11.2047 2.02387 12 2.02387C12.7953 2.02387 13.5583 2.33886 14.122 2.89993L21.707 10.4859C21.8931 10.6732 21.9983 10.9259 22 11.1899V21.0069Z'
        fill='#617AF9'
      />
    </g>
    <defs>
      <clipPath id='clip0_3207_9846'>
        <rect width={24} height={24} fill='white' />
      </clipPath>
    </defs>
  </svg>
);
const Memo = memo(SvgIcHome);
export default Memo;
