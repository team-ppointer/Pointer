import { memo } from "react";

const AngleBracketIcon = (props) => (
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
      fill="url(#pattern0_296_34352)"
    />
    <defs>
      <pattern
        id="pattern0_296_34352"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34352"
          transform="matrix(0.011236 0 0 0.0118602 0 -0.039638)"
        />
      </pattern>
      <image
        id="image0_296_34352"
        width="89"
        height="91"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(AngleBracketIcon);
