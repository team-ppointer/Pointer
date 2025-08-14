import { memo } from "react";

const DoubleBarIcon = (props) => (
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
      fill="url(#pattern0_296_34354)"
    />
    <defs>
      <pattern
        id="pattern0_296_34354"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34354"
          transform="matrix(0.0113636 0 0 0.0119949 0 -0.0397727)"
        />
      </pattern>
      <image
        id="image0_296_34354"
        width="88"
        height="90"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFgAAABaCAYAAAA8XZE/AAABYWlDQ1BJQ0MgUHJvZmlsZQAAKJFtkD1Lw3AQxp/U1oKKFNFFHLI4CPWFWgXdaqu1kCG01jcQTNM0LTTp3zQiipsufgERP4CDuNexmx9AUXR2cROELlri/RO1rXpwPD8e7o67A3whhbGyH4Bh2lY6uSCub2yKwRd0YwBDmEREUassJssSleBbO6NxD4Hr7TifdZKYCxSOHg8vK/2L56sH2b/1HdGT16oq6QflrMosGxCixPKezTgfEw9atBTxGWfd4yvOOY/rbs1KOk58RxxSi0qe+Jk4nGvz9TY2yrvq1w58+z7NzGZIhylHICEJESnIyJAuIUuOhGUk6E//90XdvjgqYNiHhRJ0FGFTd4wchjI0d6IJFRMIE0cwRTnD//37jy1vh+6bTwE+o+Vty8D1Kz+z5Y2GaZUboL7FFEv5+a7Q8FcL0xGPe2tA4NRx3taA4BjQfHCc95rjNC+ArifqbXwCaMdi6VFEISgAAABWZVhJZk1NACoAAAAIAAGHaQAEAAAAAQAAABoAAAAAAAOShgAHAAAAEgAAAESgAgAEAAAAAQAAAFigAwAEAAAAAQAAAFoAAAAAQVNDSUkAAABTY3JlZW5zaG908TFvdgAAAdRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDYuMC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+OTA8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+ODg8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpVc2VyQ29tbWVudD5TY3JlZW5zaG90PC9leGlmOlVzZXJDb21tZW50PgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KjcphfAAAAeZJREFUeAHt3UFqwgAUhGEtvZGH8kweyjO1pZssrPAz04EsflcSZ57x80EWBrx+/TwuPmYCH7PJDv4VEHi8CAILPBYYj3eDBR4LjMe7wQKPBcbj3eAx8Gcy/36/v9Qej8fLMZp7KQ4O0HOhOXqKbjCVCnMCh3C0JjCVCnMCh3C0JjCVCnMCh3C0JjCVCnMCh3C0JjCVCnMCh3C0JjCVCnMCh3C0JjCVCnMCh3C0JjCVCnMCh3C0JjCVCnMCh3C0JjCVCnPRb3Lhe72tPZ/Pt68lL9xut6Q26bjBE9ZjqMCHxeSZwBPWY6jAh8Xk2Skucn99Mnqh+u8L5F/n0hxzgxs90BUYIDURgRs90BUYIDURgRs90BUYIDURgRs90BUYIDURgRs90BUYIDURgRs90BUYIDURgRs90BUYIDURgRs90BUYIDURgRs90BUYIDURgRs90BUYIDURgRs90BUYIDURgRs90BUYIDWR0954cvYbSii6G0ylwpzAIRytCUylwpzAIRytneIiR++kpB/qTDk3ePxtCCzwWGA83g0WeCwwHu8GCzwWGI93gwUeC4zHu8ECjwXG491ggccC4/Fu8Bj46v/JbYXd4K3vRWCBxwLj8W6wwGOB8Xg3WOCxwHi8GyzwWGA8/hsqxR21NPbrwgAAAABJRU5ErkJggg=="
      />
    </defs>
  </svg>
);

export default memo(DoubleBarIcon);
