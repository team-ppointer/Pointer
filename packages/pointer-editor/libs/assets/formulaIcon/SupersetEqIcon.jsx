import { memo } from "react";

const SupersetEqIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34511)" />
    <defs>
      <pattern
        id="pattern0_296_34511"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34511"
          transform="matrix(0.0117647 0 0 0.0124183 0 -0.0401961)"
        />
      </pattern>
      <image
        id="image0_296_34511"
        width="85"
        height="87"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(SupersetEqIcon);
