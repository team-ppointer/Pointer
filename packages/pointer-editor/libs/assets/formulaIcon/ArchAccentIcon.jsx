import { memo } from "react";

const ArchAccentIcon = (props) => (
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
      fill="url(#pattern0_296_34177)"
    />
    <defs>
      <pattern
        id="pattern0_296_34177"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34177"
          transform="matrix(0.0131579 0 0 0.0138889 0 -0.0625)"
        />
      </pattern>
      <image
        id="image0_296_34177"
        width="76"
        height="81"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,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"
      />
    </defs>
  </svg>
);

export default memo(ArchAccentIcon);
