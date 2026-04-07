import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcMore = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-labelledby={titleId}
    {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M0 4C0 1.79086 1.79086 0 4 0H20C22.2091 0 24 1.79086 24 4V20C24 22.2091 22.2091 24 20 24H4C1.79086 24 0 22.2091 0 20V4Z'
      fill='#EDEEF2'
    />
    <g clipPath='url(#clip0_2486_23230)'>
      <path
        d='M7 13.0001C7.55228 13.0001 8 12.5524 8 12.0001C8 11.4478 7.55228 11.0001 7 11.0001C6.44772 11.0001 6 11.4478 6 12.0001C6 12.5524 6.44772 13.0001 7 13.0001Z'
        fill='#6B6F77'
      />
      <path
        d='M12 13.0001C12.5523 13.0001 13 12.5524 13 12.0001C13 11.4478 12.5523 11.0001 12 11.0001C11.4477 11.0001 11 11.4478 11 12.0001C11 12.5524 11.4477 13.0001 12 13.0001Z'
        fill='#6B6F77'
      />
      <path
        d='M17 13.0001C17.5523 13.0001 18 12.5524 18 12.0001C18 11.4478 17.5523 11.0001 17 11.0001C16.4477 11.0001 16 11.4478 16 12.0001C16 12.5524 16.4477 13.0001 17 13.0001Z'
        fill='#6B6F77'
      />
    </g>
    <defs>
      <clipPath id='clip0_2486_23230'>
        <rect width='12' height='12' fill='white' transform='translate(6 6)' />
      </clipPath>
    </defs>
  </svg>
);
const Memo = memo(SvgIcMore);
export default Memo;
