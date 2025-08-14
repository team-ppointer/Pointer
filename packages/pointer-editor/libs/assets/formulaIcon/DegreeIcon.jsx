import { memo } from "react";
const DegreeIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34616)" />
    <defs>
      <pattern
        id="pattern0_296_34616"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34616"
          transform="matrix(0.0149254 0 0 0.0157546 0.0255977 -0.0435323)"
        />
      </pattern>
      <image
        id="image0_296_34616"
        width="67"
        height="69"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(DegreeIcon);
