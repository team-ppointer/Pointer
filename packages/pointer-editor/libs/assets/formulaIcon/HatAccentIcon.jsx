import { memo } from "react";

const HatAccentIcon = (props) => (
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
      fill="url(#pattern0_296_34175)"
    />
    <defs>
      <pattern
        id="pattern0_296_34175"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34175"
          transform="matrix(0.0128205 0 0 0.0135328 0 -0.0210114)"
        />
      </pattern>
      <image
        id="image0_296_34175"
        width="78"
        height="77"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(HatAccentIcon);
