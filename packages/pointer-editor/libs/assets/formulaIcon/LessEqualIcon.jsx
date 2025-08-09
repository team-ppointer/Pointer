import { memo } from "react";
const LessEqualIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34515)" />
    <defs>
      <pattern
        id="pattern0_296_34515"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34515"
          transform="matrix(0.0108696 0 0 0.0114734 0 -0.0449879)"
        />
      </pattern>
      <image
        id="image0_296_34515"
        width="92"
        height="95"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(LessEqualIcon);
