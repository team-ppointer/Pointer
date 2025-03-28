import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcTagIncorrect = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <g clipPath='url(#clip0_3106_14070)'>
      <path
        d='M10.6669 5.33337C10.5419 5.20839 10.3724 5.13818 10.1956 5.13818C10.0188 5.13818 9.8493 5.20839 9.72428 5.33337L8.00029 7.05737L6.27629 5.33337C6.15056 5.21194 5.98215 5.14474 5.80736 5.14626C5.63256 5.14778 5.46535 5.21789 5.34175 5.3415C5.21814 5.4651 5.14803 5.63231 5.14651 5.80711C5.14499 5.98191 5.21219 6.15031 5.33363 6.27604L7.05762 8.00004L5.33363 9.72404C5.21219 9.84978 5.14499 10.0182 5.14651 10.193C5.14803 10.3678 5.21814 10.535 5.34175 10.6586C5.46535 10.7822 5.63256 10.8523 5.80736 10.8538C5.98215 10.8553 6.15056 10.7881 6.27629 10.6667L8.00029 8.94271L9.72428 10.6667C9.85002 10.7881 10.0184 10.8553 10.1932 10.8538C10.368 10.8523 10.5352 10.7822 10.6588 10.6586C10.7824 10.535 10.8525 10.3678 10.8541 10.193C10.8556 10.0182 10.7884 9.84978 10.6669 9.72404L8.94295 8.00004L10.6669 6.27604C10.7919 6.15102 10.8621 5.98148 10.8621 5.80471C10.8621 5.62793 10.7919 5.45839 10.6669 5.33337Z'
        fill='#D20000'
      />
      <path
        d='M8 0C6.41775 0 4.87103 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00888 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C15.9977 5.87897 15.1541 3.84547 13.6543 2.34568C12.1545 0.845886 10.121 0.00229405 8 0V0ZM8 14.6667C6.68146 14.6667 5.39253 14.2757 4.2962 13.5431C3.19987 12.8106 2.34539 11.7694 1.84081 10.5512C1.33622 9.33305 1.2042 7.99261 1.46144 6.6994C1.71867 5.40619 2.35361 4.21831 3.28596 3.28596C4.21831 2.3536 5.4062 1.71867 6.6994 1.46143C7.99261 1.2042 9.33305 1.33622 10.5512 1.8408C11.7694 2.34539 12.8106 3.19987 13.5431 4.2962C14.2757 5.39253 14.6667 6.68146 14.6667 8C14.6647 9.76752 13.9617 11.4621 12.7119 12.7119C11.4621 13.9617 9.76752 14.6647 8 14.6667V14.6667Z'
        fill='#D20000'
      />
    </g>
    <defs>
      <clipPath id='clip0_3106_14070'>
        <rect width={16} height={16} fill='white' />
      </clipPath>
    </defs>
  </svg>
);
const Memo = memo(SvgIcTagIncorrect);
export default Memo;
