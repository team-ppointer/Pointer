import { memo } from "react";

const ProductIcon = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 4C0 1.79086 1.79086 0 4 0H20C22.2091 0 24 1.79086 24 4V20C24 22.2091 22.2091 24 20 24H4C1.79086 24 0 22.2091 0 20V4Z"
      fill="white"
    />
    <rect
      x="2.5"
      y="3"
      width="19"
      height="18"
      fill="url(#pattern0_296_34239)"
    />
    <defs>
      <pattern
        id="pattern0_296_34239"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34239"
          transform="matrix(0.0107527 0 0 0.0113501 0.040231 -0.0221027)"
        />
      </pattern>
      <image
        id="image0_296_34239"
        width="93"
        height="92"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(ProductIcon);
