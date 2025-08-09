import { memo } from "react";

const SubscriptIcon = (props) => (
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
      fill="url(#pattern0_296_33721)"
    />
    <defs>
      <pattern
        id="pattern0_296_33721"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_33721"
          transform="matrix(0.0139319 0 0 0.0147059 -0.0642415 0)"
        />
      </pattern>
      <image
        id="image0_296_33721"
        width="81"
        height="68"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(SubscriptIcon);
