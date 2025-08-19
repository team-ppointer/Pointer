import { memo } from "react";

const MatrixIcon = (props) => (
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
      fill="url(#pattern0_1461_2671)"
    />
    <defs>
      <pattern
        id="pattern0_1461_2671"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_1461_2671"
          transform="matrix(0.0108893 0 0 0.0114943 -0.03902 0)"
        />
      </pattern>
      <image
        id="image0_1461_2671"
        width="99"
        height="87"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(MatrixIcon);
