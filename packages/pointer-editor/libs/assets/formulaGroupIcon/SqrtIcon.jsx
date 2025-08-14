import { memo } from "react";

const SqrtIcon = (props) => (
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
      fill="url(#pattern0_1461_2636)"
    />
    <defs>
      <pattern
        id="pattern0_1461_2636"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_1461_2636"
          transform="matrix(0.0108893 0 0 0.0114943 -0.03902 0)"
        />
      </pattern>
      <image
        id="image0_1461_2636"
        width="99"
        height="87"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(SqrtIcon);
