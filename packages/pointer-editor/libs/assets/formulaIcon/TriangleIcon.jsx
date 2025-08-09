import { memo } from "react";
const TriangleIcon = (props) => (
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
      fill="url(#pattern0_296_34752)"
    />
    <defs>
      <pattern
        id="pattern0_296_34752"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34752"
          transform="matrix(0.0106383 0 0 0.0112293 0 -0.0165485)"
        />
      </pattern>
      <image
        id="image0_296_34752"
        width="94"
        height="92"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(TriangleIcon);
