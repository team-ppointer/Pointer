import { memo } from "react";
const SucceedsIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      width="19"
      height="18"
      transform="matrix(-1 0 0 1 19 0)"
      fill="url(#pattern0_296_34526)"
    />
    <defs>
      <pattern
        id="pattern0_296_34526"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34526"
          transform="matrix(0.0116279 0 0 0.0122739 0 -0.0339147)"
        />
      </pattern>
      <image
        id="image0_296_34526"
        width="86"
        height="87"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(SucceedsIcon);
