import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcLeftSm = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M2.61398 8.81183C2.50686 8.70559 2.42184 8.57919 2.36383 8.43993C2.30581 8.30068 2.27594 8.15131 2.27594 8.00044C2.27594 7.84958 2.30581 7.70021 2.36383 7.56095C2.42184 7.42169 2.50686 7.2953 2.61398 7.18906L7.85939 1.95508C7.9665 1.84884 8.05152 1.72245 8.10953 1.58319C8.16755 1.44393 8.19742 1.29456 8.19742 1.1437C8.19742 0.992835 8.16755 0.843466 8.10953 0.704206C8.05152 0.564946 7.9665 0.438552 7.85939 0.332315C7.64527 0.119469 7.35563 0 7.05372 0C6.75181 0 6.46217 0.119469 6.24805 0.332315L1.00264 5.57773C0.360616 6.22055 0 7.09192 0 8.00044C0 8.90897 0.360616 9.78034 1.00264 10.4232L6.24805 15.6686C6.46091 15.8797 6.7482 15.9987 7.048 16C7.1984 16.0009 7.34749 15.972 7.48673 15.9152C7.62596 15.8583 7.7526 15.7745 7.85939 15.6686C7.9665 15.5623 8.05152 15.4359 8.10953 15.2967C8.16755 15.1574 8.19742 15.0081 8.19742 14.8572C8.19742 14.7063 8.16755 14.557 8.10953 14.4177C8.05152 14.2784 7.9665 14.152 7.85939 14.0458L2.61398 8.81183Z'
      fill='white'
    />
  </svg>
);
const Memo = memo(SvgIcLeftSm);
export default Memo;
