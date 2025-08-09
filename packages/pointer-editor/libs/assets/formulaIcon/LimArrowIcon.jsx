import { memo } from "react";

const LimArrowIcon = (props) => (
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
      fill="url(#pattern0_296_34871)"
    />
    <defs>
      <pattern
        id="pattern0_296_34871"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34871"
          transform="matrix(0.011236 0 0 0.0118602 0 -0.0633583)"
        />
      </pattern>
      <image
        id="image0_296_34871"
        width="89"
        height="95"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(LimArrowIcon);
