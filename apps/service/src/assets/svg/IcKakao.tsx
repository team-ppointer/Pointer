import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcKakao = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M12 17.6992C16.9706 17.6992 21 14.6325 21 10.8496C21 7.06667 16.9706 4 12 4C7.02944 4 3 7.06667 3 10.8496C3 13.3572 4.77049 15.55 7.41198 16.7436L6.51522 19.6879C6.44989 19.9024 6.69025 20.0815 6.88209 19.9613L10.5174 17.6831C10.5472 17.6644 10.571 17.6413 10.5889 17.6155C11.0486 17.6706 11.5199 17.6992 12 17.6992Z'
      fill='black'
    />
  </svg>
);
const Memo = memo(SvgIcKakao);
export default Memo;
