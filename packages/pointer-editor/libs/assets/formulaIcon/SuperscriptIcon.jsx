import { memo } from "react";

const SuperscriptIcon = (props) => (
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
      fill="url(#pattern0_296_34150)"
    />
    <defs>
      <pattern
        id="pattern0_296_34150"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34150"
          transform="matrix(0.0121457 0 0 0.0128205 -0.00404858 0)"
        />
      </pattern>
      <image
        id="image0_296_34150"
        width="83"
        height="78"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(SuperscriptIcon);
