import { memo } from "react";

const LimToZeroIcon = (props) => (
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
      fill="url(#pattern0_296_34872)"
    />
    <defs>
      <pattern
        id="pattern0_296_34872"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34872"
          transform="matrix(0.0106383 0 0 0.0112293 0 -0.0670804)"
        />
      </pattern>
      <image
        id="image0_296_34872"
        width="94"
        height="101"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(LimToZeroIcon);
