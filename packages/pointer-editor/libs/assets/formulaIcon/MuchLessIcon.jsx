import { memo } from "react";
const MuchLessIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34521)" />
    <defs>
      <pattern
        id="pattern0_296_34521"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34521"
          transform="matrix(0.0117647 0 0 0.0124183 0 -0.0836601)"
        />
      </pattern>
      <image
        id="image0_296_34521"
        width="85"
        height="94"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(MuchLessIcon);
