import { memo } from "react";

const SubsetIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34508)" />
    <defs>
      <pattern
        id="pattern0_296_34508"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34508"
          transform="matrix(0.0120482 0 0 0.0127175 0 -0.0404953)"
        />
      </pattern>
      <image
        id="image0_296_34508"
        width="83"
        height="85"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(SubsetIcon);
