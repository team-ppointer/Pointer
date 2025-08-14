import { memo } from "react";
const ElementOfIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34512)" />
    <defs>
      <pattern
        id="pattern0_296_34512"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34512"
          transform="matrix(0.0113636 0 0 0.0119949 0 -0.0157828)"
        />
      </pattern>
      <image
        id="image0_296_34512"
        width="88"
        height="86"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(ElementOfIcon);
