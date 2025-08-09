import { memo } from "react";

const DragHandleIcon = (props) => (
  <svg
    width="16"
    height="17"
    viewBox="0 0 16 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect y="0.5" width="16" height="16" rx="8" fill="#EDEEF2" />
    <path d="M12 10H4M12 7H4" stroke="#3E3F45" strokeLinecap="round" />
  </svg>
);

export default memo(DragHandleIcon);
