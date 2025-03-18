import type { SVGProps } from 'react';
import { memo } from 'react';
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const SvgIcSecret = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby={titleId} {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <g clipPath='url(#clip0_3194_659)'>
      <path
        d='M23.2715 9.91882C22.3688 8.44054 21.23 7.12007 19.9005 6.00982L22.7005 3.20982C22.8827 3.02122 22.9835 2.76861 22.9812 2.50642C22.9789 2.24422 22.8738 1.99341 22.6884 1.808C22.503 1.62259 22.2521 1.51742 21.9899 1.51514C21.7277 1.51287 21.4751 1.61366 21.2865 1.79582L18.2415 4.84482C16.3539 3.72364 14.196 3.13928 12.0005 3.15482C5.80954 3.15482 2.28154 7.39282 0.72954 9.91882C0.250068 10.6943 -0.00390625 11.5881 -0.00390625 12.4998C-0.00390625 13.4116 0.250068 14.3053 0.72954 15.0808C1.6323 16.5591 2.77103 17.8796 4.10054 18.9898L1.30054 21.7898C1.20503 21.8821 1.12885 21.9924 1.07644 22.1144C1.02403 22.2364 0.996443 22.3676 0.995289 22.5004C0.994135 22.6332 1.01944 22.7649 1.06972 22.8878C1.12 23.0107 1.19425 23.1223 1.28814 23.2162C1.38204 23.3101 1.49369 23.3844 1.61659 23.4346C1.73948 23.4849 1.87116 23.5102 2.00394 23.5091C2.13672 23.5079 2.26794 23.4803 2.38994 23.4279C2.51195 23.3755 2.62229 23.2993 2.71454 23.2038L5.76654 20.1518C7.65181 21.2728 9.80721 21.8582 12.0005 21.8448C18.1915 21.8448 21.7195 17.6068 23.2715 15.0808C23.751 14.3053 24.005 13.4116 24.005 12.4998C24.005 11.5881 23.751 10.6943 23.2715 9.91882ZM2.43354 14.0338C2.14867 13.5729 1.99779 13.0417 1.99779 12.4998C1.99779 11.9579 2.14867 11.4268 2.43354 10.9658C3.76754 8.79982 6.78254 5.15482 12.0005 5.15482C13.6608 5.14552 15.2978 5.54566 16.7665 6.31982L14.7535 8.33282C13.7935 7.69542 12.6424 7.40981 11.4958 7.52446C10.3491 7.63911 9.27741 8.14696 8.46254 8.96182C7.64768 9.77668 7.13983 10.8484 7.02519 11.9951C6.91054 13.1417 7.19614 14.2928 7.83354 15.2528L5.52354 17.5628C4.29864 16.5725 3.25338 15.3788 2.43354 14.0338ZM15.0005 12.4998C15.0005 13.2955 14.6845 14.0585 14.1219 14.6211C13.5593 15.1837 12.7962 15.4998 12.0005 15.4998C11.5551 15.4981 11.1157 15.3955 10.7155 15.1998L14.7005 11.2148C14.8963 11.615 14.9988 12.0543 15.0005 12.4998ZM9.00054 12.4998C9.00054 11.7042 9.31661 10.9411 9.87922 10.3785C10.4418 9.81589 11.2049 9.49982 12.0005 9.49982C12.446 9.50154 12.8853 9.60411 13.2855 9.79982L9.30054 13.7848C9.10483 13.3846 9.00226 12.9453 9.00054 12.4998ZM21.5675 14.0338C20.2335 16.1998 17.2185 19.8448 12.0005 19.8448C10.3403 19.8541 8.7033 19.454 7.23454 18.6798L9.24754 16.6668C10.2076 17.3042 11.3586 17.5898 12.5053 17.4752C13.652 17.3605 14.7237 16.8527 15.5385 16.0378C16.3534 15.223 16.8612 14.1513 16.9759 13.0046C17.0905 11.8579 16.8049 10.7069 16.1675 9.74682L18.4775 7.43682C19.7024 8.4271 20.7477 9.62087 21.5675 10.9658C21.8524 11.4268 22.0033 11.9579 22.0033 12.4998C22.0033 13.0417 21.8524 13.5729 21.5675 14.0338Z'
        fill='#C6CAD4'
      />
    </g>
    <defs>
      <clipPath id='clip0_3194_659'>
        <rect width={24} height={24} fill='white' transform='translate(0 0.5)' />
      </clipPath>
    </defs>
  </svg>
);
const Memo = memo(SvgIcSecret);
export default Memo;
