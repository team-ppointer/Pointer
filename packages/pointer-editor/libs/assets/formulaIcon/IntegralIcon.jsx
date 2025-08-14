import { memo } from "react";

const IntegralIcon = (props) => (
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
      fill="url(#pattern0_296_34311)"
    />
    <defs>
      <pattern
        id="pattern0_296_34311"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34311"
          transform="matrix(0.0121951 0 0 0.0128726 0 -0.0599593)"
        />
      </pattern>
      <image
        id="image0_296_34311"
        width="82"
        height="87"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(IntegralIcon);
