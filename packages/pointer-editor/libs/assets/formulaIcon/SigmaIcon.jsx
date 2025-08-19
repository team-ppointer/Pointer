import { memo } from "react";

const SigmaIcon = (props) => (
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
      fill="url(#pattern0_296_34238)"
    />
    <defs>
      <pattern
        id="pattern0_296_34238"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34238"
          transform="matrix(0.00947368 0 0 0.01 0.106842 0)"
        />
      </pattern>
      <image
        id="image0_296_34238"
        width="83"
        height="100"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(SigmaIcon);
