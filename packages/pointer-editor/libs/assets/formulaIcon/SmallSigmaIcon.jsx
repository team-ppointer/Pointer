import { memo } from "react";

const SmallSigmaIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34494)" />
    <defs>
      <pattern
        id="pattern0_296_34494"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34494"
          transform="matrix(0.0123457 0 0 0.0130316 0 -0.0277778)"
        />
      </pattern>
      <image
        id="image0_296_34494"
        width="81"
        height="81"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(SmallSigmaIcon);
