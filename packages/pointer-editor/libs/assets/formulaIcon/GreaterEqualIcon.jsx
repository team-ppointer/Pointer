import { memo } from "react";
const GreaterEqualIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34516)" />
    <defs>
      <pattern
        id="pattern0_296_34516"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34516"
          transform="matrix(0.011236 0 0 0.0118602 0 -0.0811486)"
        />
      </pattern>
      <image
        id="image0_296_34516"
        width="89"
        height="98"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(GreaterEqualIcon);
