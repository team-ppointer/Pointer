import { memo } from "react";

const SmallInterIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34497)" />
    <defs>
      <pattern
        id="pattern0_296_34497"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34497"
          transform="matrix(0.0118421 0 0 0.0125 -0.00921053 0)"
        />
      </pattern>
      <image
        id="image0_296_34497"
        width="86"
        height="80"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(SmallInterIcon);
