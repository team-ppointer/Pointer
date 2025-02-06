import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcUnselected = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <g clipPath='url(#clip0_1951_10078)'>
      <path
        d='M22.3186 4.43101L8.49963 18.249C8.40672 18.3423 8.29631 18.4163 8.17473 18.4668C8.05315 18.5173 7.92279 18.5433 7.79113 18.5433C7.65948 18.5433 7.52912 18.5173 7.40754 18.4668C7.28596 18.4163 7.17554 18.3423 7.08263 18.249L1.73863 12.9C1.64572 12.8067 1.53531 12.7327 1.41373 12.6822C1.29214 12.6317 1.16179 12.6057 1.03013 12.6057C0.898479 12.6057 0.768121 12.6317 0.646539 12.6822C0.524956 12.7327 0.414542 12.8067 0.321633 12.9C0.228356 12.9929 0.154344 13.1033 0.103842 13.2249C0.0533404 13.3465 0.0273437 13.4769 0.0273438 13.6085C0.0273437 13.7402 0.0533404 13.8705 0.103842 13.9921C0.154344 14.1137 0.228356 14.2241 0.321633 14.317L5.66763 19.662C6.23158 20.2249 6.99583 20.5411 7.79263 20.5411C8.58944 20.5411 9.35369 20.2249 9.91763 19.662L23.7356 5.84701C23.8288 5.75412 23.9026 5.64377 23.9531 5.52228C24.0035 5.40079 24.0294 5.27054 24.0294 5.13901C24.0294 5.00747 24.0035 4.87723 23.9531 4.75574C23.9026 4.63425 23.8288 4.5239 23.7356 4.43101C23.6427 4.33773 23.5323 4.26372 23.4107 4.21322C23.2891 4.16272 23.1588 4.13672 23.0271 4.13672C22.8955 4.13672 22.7651 4.16272 22.6435 4.21322C22.522 4.26372 22.4115 4.33773 22.3186 4.43101Z'
        fill='#C6CAD4'
      />
    </g>
    <defs>
      <clipPath id='clip0_1951_10078'>
        <rect width={24} height={24} fill='white' />
      </clipPath>
    </defs>
  </svg>
);
const Memo = memo(SvgIcUnselected);
export default Memo;
