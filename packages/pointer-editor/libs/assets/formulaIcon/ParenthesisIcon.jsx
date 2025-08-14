import { memo } from "react";

const ParenthesisIcon = (props) => (
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
      fill="url(#pattern0_296_34349)"
    />
    <defs>
      <pattern
        id="pattern0_296_34349"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34349"
          transform="matrix(0.0117647 0 0 0.0124183 0 -0.0898693)"
        />
      </pattern>
      <image
        id="image0_296_34349"
        width="85"
        height="95"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(ParenthesisIcon);
