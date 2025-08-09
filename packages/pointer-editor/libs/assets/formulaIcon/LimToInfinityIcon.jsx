import { memo } from "react";

const LimToInfinityIcon = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 4C0 1.79086 1.79086 0 4 0H20C22.2091 0 24 1.79086 24 4V20C24 22.2091 22.2091 24 20 24H4C1.79086 24 0 22.2091 0 20V4Z"
      fill="white"
    />
    <rect
      x="2.5"
      y="3"
      width="19"
      height="18"
      fill="url(#pattern0_296_34873)"
    />
    <defs>
      <pattern
        id="pattern0_296_34873"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34873"
          transform="matrix(0.0105263 0 0 0.0111111 0 -0.0166667)"
        />
      </pattern>
      <image
        id="image0_296_34873"
        width="95"
        height="93"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(LimToInfinityIcon);
