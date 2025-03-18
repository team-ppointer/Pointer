import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgLogoHeader = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      d='M0.680385 0H11.9067C16.6038 0 20.4116 3.97646 20.4116 8.67354C20.4116 13.3706 16.6038 17.1784 11.9067 17.1784C10.9673 17.1784 10.2058 17.9399 10.2058 18.8793V23.3018C10.2058 23.6776 9.90116 23.9822 9.52539 23.9822H7.41786C7.07767 23.9822 6.73747 23.642 6.73747 23.3018V15.1372C6.73747 14.3857 7.34671 13.7764 8.09824 13.7764H10.0452C10.6789 13.7764 11.304 13.6289 11.8708 13.3454L13.912 12.3249C16.9209 10.8204 16.9208 6.52663 13.912 5.02221L11.8708 4.00163C11.304 3.71821 10.6734 3.37427 10.0396 3.37427H0.674854C0.334661 3.37427 0 3.03961 0 2.69941L0 0.680385C0 0.304619 0.304619 0 0.680385 0Z'
      fill='#617AF9'
    />
    <path
      d='M0 23.2769V17.0566V16.3763V7.42892C0 7.05316 0.304619 6.74854 0.680385 6.74854H10.0452C10.1508 6.74854 10.255 6.77313 10.3494 6.82037L12.3906 7.82494C12.8921 8.07568 12.8921 8.79131 12.3906 9.04205L10.3494 10.051C10.255 10.0982 10.1508 10.1228 10.0452 10.1228H4.08231C3.70654 10.1228 3.40193 10.4274 3.40193 10.8032V23.2769C3.40193 23.6527 3.09731 23.9573 2.72154 23.9573H0.680385C0.304619 23.9573 0 23.6527 0 23.2769Z'
      fill='#FFC800'
    />
    <circle cx={42.6586} cy={8.26698} r={1.85585} fill='#FFC800' />
    <path
      d='M92.793 23.9574V6.83221H99.3782C103.204 6.83221 105.384 8.98865 105.384 12.3045C105.384 14.6 104.329 16.2695 102.416 17.0811L105.987 23.9574H102.138L98.9376 17.6608H96.2711V23.9574H92.793ZM96.2711 14.8319H98.729C100.793 14.8319 101.79 13.9739 101.79 12.3045C101.79 10.6118 100.793 9.68427 98.729 9.68427H96.2711V14.8319Z'
      fill='#617AF9'
    />
    <path
      d='M79.2949 23.9573V6.74854H90.43V10.1228H82.773V13.7048H89.9843V16.58H82.773V20.661H90.43V23.9573H79.2949Z'
      fill='#617AF9'
    />
    <path
      d='M63.0996 10.1228V6.74854H76.9341V10.1228H71.7022V23.9573H68.2472V10.1228H63.0996Z'
      fill='#617AF9'
    />
    <path
      d='M60.7369 6.74854L60.7484 23.9573H57.8687L50.4836 12.9537H50.3445V23.9573H46.9023V6.74854H49.9271L57.2543 17.4984H57.3626V6.74854H60.7369Z'
      fill='#617AF9'
    />
    <path d='M44.5008 12.1473V23.9573H40.7891V12.1473H44.5008Z' fill='#617AF9' />
    <path
      d='M38.401 15.3743C38.401 20.8465 34.9925 24 30.5637 24C26.0885 24 22.7031 20.8233 22.7031 15.3743C22.7031 9.90203 26.0885 6.74854 30.5637 6.74854C34.9925 6.74854 38.401 9.90203 38.401 15.3743ZM34.8534 15.3743C34.8534 11.7802 33.1607 9.83247 30.5637 9.83247C27.9667 9.83247 26.2508 11.7802 26.2508 15.3743C26.2508 18.9683 27.9667 20.9161 30.5637 20.9161C33.1607 20.9161 34.8534 18.9683 34.8534 15.3743Z'
      fill='#617AF9'
    />
  </svg>
);
const Memo = memo(SvgLogoHeader);
export default Memo;
