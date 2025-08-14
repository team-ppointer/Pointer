import { memo } from "react";
const CircleOperatorIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34614)" />
    <defs>
      <pattern
        id="pattern0_296_34614"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34614"
          transform="matrix(0.0140845 0 0 0.014867 -0.019361 -0.00547731)"
        />
      </pattern>
      <image
        id="image0_296_34614"
        width="71"
        height="68"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(CircleOperatorIcon);
