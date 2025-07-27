import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcGoogle = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <mask
      id='mask0_1686_3276'
      style={{
        maskType: 'luminance',
      }}
      maskUnits='userSpaceOnUse'
      x={0}
      y={0}
      width={21}
      height={21}>
      <path d='M20.5 0.5H0.5V20.5H20.5V0.5Z' fill='white' />
    </mask>
    <g mask='url(#mask0_1686_3276)'>
      <path
        d='M20.1 10.7271C20.1 10.018 20.0364 9.33624 19.9182 8.68164H10.5V12.5498H15.8818C15.65 13.7998 14.9455 14.8589 13.8864 15.568V18.0771H17.1182C19.0091 16.3362 20.1 13.7725 20.1 10.7271Z'
        fill='#4285F4'
      />
      <path
        d='M10.4989 20.4999C13.1989 20.4999 15.4625 19.6044 17.1171 18.0772L13.8853 15.5681C12.9898 16.1681 11.8443 16.5226 10.4989 16.5226C7.8943 16.5226 5.6898 14.7635 4.9034 12.3999H1.5625V14.9908C3.208 18.259 6.5898 20.4999 10.4989 20.4999Z'
        fill='#34A853'
      />
      <path
        d='M4.9045 12.4002C4.7045 11.8002 4.5909 11.1593 4.5909 10.5002C4.5909 9.84108 4.7045 9.20018 4.9045 8.60018V6.00928H1.5636C0.886401 7.35928 0.5 8.88658 0.5 10.5002C0.5 12.1138 0.886401 13.6411 1.5636 14.9911L4.9045 12.4002Z'
        fill='#FBBC04'
      />
      <path
        d='M10.4989 4.4773C11.9671 4.4773 13.2852 4.9818 14.3216 5.9727L17.1898 3.1045C15.458 1.4909 13.1943 0.5 10.4989 0.5C6.5898 0.5 3.208 2.7409 1.5625 6.0091L4.9034 8.6C5.6898 6.2364 7.8943 4.4773 10.4989 4.4773Z'
        fill='#E94235'
      />
    </g>
  </svg>
);
const Memo = memo(SvgIcGoogle);
export default Memo;
