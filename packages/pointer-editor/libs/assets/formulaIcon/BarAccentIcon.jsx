import { memo } from "react";

const BarAccentIcon = (props) => (
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
      fill="url(#pattern0_296_34174)"
    />
    <defs>
      <pattern
        id="pattern0_296_34174"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34174"
          transform="matrix(0.0123457 0 0 0.0130316 0 -0.0277778)"
        />
      </pattern>
      <image
        id="image0_296_34174"
        width="81"
        height="81"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(BarAccentIcon);
