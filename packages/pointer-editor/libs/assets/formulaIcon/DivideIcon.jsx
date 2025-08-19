import { memo } from "react";
const DivideIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34613)" />
    <defs>
      <pattern
        id="pattern0_296_34613"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34613"
          transform="matrix(0.0114943 0 0 0.0121328 0 -0.0338442)"
        />
      </pattern>
      <image
        id="image0_296_34613"
        width="87"
        height="88"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(DivideIcon);
