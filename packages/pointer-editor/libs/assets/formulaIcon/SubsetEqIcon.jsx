import { memo } from "react";

const SubsetEqIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34510)" />
    <defs>
      <pattern
        id="pattern0_296_34510"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34510"
          transform="matrix(0.0111111 0 0 0.0117284 0 -0.00432099)"
        />
      </pattern>
      <image
        id="image0_296_34510"
        width="90"
        height="86"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(SubsetEqIcon);
