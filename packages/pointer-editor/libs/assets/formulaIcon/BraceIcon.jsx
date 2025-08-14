import { memo } from "react";

const BraceIcon = (props) => (
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
      fill="url(#pattern0_296_34351)"
    />
    <defs>
      <pattern
        id="pattern0_296_34351"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34351"
          transform="matrix(0.0112782 0 0 0.0119048 -0.0244361 0)"
        />
      </pattern>
      <image
        id="image0_296_34351"
        width="93"
        height="84"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(BraceIcon);
