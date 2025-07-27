import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcTagSelected = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M0 4C0 1.79086 1.79086 0 4 0H32C34.2091 0 36 1.79086 36 4V32C36 34.2091 34.2091 36 32 36H4C1.79086 36 0 34.2091 0 32V4Z'
      fill='#EDEEF2'
    />
    <path
      d='M15.3328 21.7733L11.4138 17.8543C11.2263 17.6668 10.972 17.5615 10.7068 17.5615C10.4417 17.5615 10.1873 17.6668 9.99982 17.8543C9.81235 18.0418 9.70703 18.2961 9.70703 18.5613C9.70703 18.8265 9.81235 19.0808 9.99982 19.2683L13.9188 23.1873C14.1045 23.3731 14.3251 23.5205 14.5678 23.621C14.8105 23.7216 15.0706 23.7734 15.3333 23.7734C15.596 23.7734 15.8562 23.7216 16.0989 23.621C16.3416 23.5205 16.5621 23.3731 16.7478 23.1873L25.9998 13.9353C26.1873 13.7478 26.2926 13.4935 26.2926 13.2283C26.2926 12.9631 26.1873 12.7088 25.9998 12.5213C25.8123 12.3338 25.558 12.2285 25.2928 12.2285C25.0277 12.2285 24.7733 12.3338 24.5858 12.5213L15.3328 21.7733Z'
      fill='#3E3F45'
    />
  </svg>
);
const Memo = memo(SvgIcTagSelected);
export default Memo;
