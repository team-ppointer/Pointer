import { memo } from "react";

const FractionIcon = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 0.5H20C21.933 0.5 23.5 2.067 23.5 4V20C23.5 21.933 21.933 23.5 20 23.5H4C2.067 23.5 0.5 21.933 0.5 20V4C0.5 2.067 2.067 0.5 4 0.5Z"
      fill="white"
    />
    <path
      d="M4 0.5H20C21.933 0.5 23.5 2.067 23.5 4V20C23.5 21.933 21.933 23.5 20 23.5H4C2.067 23.5 0.5 21.933 0.5 20V4C0.5 2.067 2.067 0.5 4 0.5Z"
      stroke="#C6CAD4"
    />
    <rect
      x="2.5"
      y="3"
      width="19"
      height="18"
      fill="url(#pattern0_1461_2634)"
    />
    <defs>
      <pattern
        id="pattern0_1461_2634"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_1461_2634"
          transform="matrix(0.0100784 0 0 0.0106383 -0.0139978 0)"
        />
      </pattern>
      <image
        id="image0_1461_2634"
        width="102"
        height="94"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(FractionIcon);
