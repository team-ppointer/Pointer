import { memo } from "react";

const SupersetIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34509)" />
    <defs>
      <pattern
        id="pattern0_296_34509"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34509"
          transform="matrix(0.0126582 0 0 0.0133615 0 -0.0745429)"
        />
      </pattern>
      <image
        id="image0_296_34509"
        width="79"
        height="86"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(SupersetIcon);
