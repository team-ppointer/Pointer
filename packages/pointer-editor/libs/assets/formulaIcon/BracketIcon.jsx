import { memo } from "react";

const BracketIcon = (props) => (
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
      fill="url(#pattern0_296_34350)"
    />
    <defs>
      <pattern
        id="pattern0_296_34350"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34350"
          transform="matrix(0.0108696 0 0 0.0114734 0 -0.0220411)"
        />
      </pattern>
      <image
        id="image0_296_34350"
        width="92"
        height="91"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(BracketIcon);
