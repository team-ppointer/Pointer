import { memo } from "react";

const AlphaIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34403)" />
    <defs>
      <pattern
        id="pattern0_296_34403"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34403"
          transform="matrix(0.012987 0 0 0.0137085 0 -0.0209235)"
        />
      </pattern>
      <image
        id="image0_296_34403"
        width="77"
        height="76"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(AlphaIcon);
