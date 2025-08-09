import { memo } from "react";
const GammaIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34405)" />
    <defs>
      <pattern
        id="pattern0_296_34405"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34405"
          transform="matrix(0.0140845 0 0 0.014867 0 -0.0575117)"
        />
      </pattern>
      <image
        id="image0_296_34405"
        width="71"
        height="75"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(GammaIcon);
