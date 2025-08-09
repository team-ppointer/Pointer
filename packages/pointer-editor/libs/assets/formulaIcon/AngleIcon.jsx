import { memo } from "react";
const AngleIcon = (props) => (
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
      fill="url(#pattern0_296_34753)"
    />
    <defs>
      <pattern
        id="pattern0_296_34753"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34753"
          transform="matrix(0.010101 0 0 0.0106622 0 -0.0117845)"
        />
      </pattern>
      <image
        id="image0_296_34753"
        width="99"
        height="96"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAABgCAYAAAAJr8w7AAABYWlDQ1BJQ0MgUHJvZmlsZQAAKJFtkD1Lw3AQxp/U1oKKFNFFHLI4CPWFWgXdaqu1kCG01jcQTNM0LTTp3zQiipsufgERP4CDuNexmx9AUXR2cROELlri/RO1rXpwPD8e7o67A3whhbGyH4Bh2lY6uSCub2yKwRd0YwBDmEREUassJssSleBbO6NxD4Hr7TifdZKYCxSOHg8vK/2L56sH2b/1HdGT16oq6QflrMosGxCixPKezTgfEw9atBTxGWfd4yvOOY/rbs1KOk58RxxSi0qe+Jk4nGvz9TY2yrvq1w58+z7NzGZIhylHICEJESnIyJAuIUuOhGUk6E//90XdvjgqYNiHhRJ0FGFTd4wchjI0d6IJFRMIE0cwRTnD//37jy1vh+6bTwE+o+Vty8D1Kz+z5Y2GaZUboL7FFEv5+a7Q8FcL0xGPe2tA4NRx3taA4BjQfHCc95rjNC+ArifqbXwCaMdi6VFEISgAAABWZVhJZk1NACoAAAAIAAGHaQAEAAAAAQAAABoAAAAAAAOShgAHAAAAEgAAAESgAgAEAAAAAQAAAGOgAwAEAAAAAQAAAGAAAAAAQVNDSUkAAABTY3JlZW5zaG90jhEmrAAAAdRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDYuMC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+OTY8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+OTk8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpVc2VyQ29tbWVudD5TY3JlZW5zaG90PC9leGlmOlVzZXJDb21tZW50PgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KL8ZOBwAAAlJJREFUeAHt3e1xglAQhWFNMTZoHRZgHViNzSSShMmHCnJ3gbO7L3+c4cJxPY93/KXu32/HjkOigTeJKRjiswEwhN4IYIAh1IDQKOwMMIQaEBqFnQGGUANCo7AzwBBqQGgUdgYYQg0IjcLOAEOoAaFR2BkjGNfrdWTVfwmMJ532EKfTaXe5XJ5c4X8ajAedDhD9Utd1q4GA8Q/jN8SwtBYIGEPjt8dHEMNyD7L0AcZ3w2MQ/SXH43Fpix0Yt4pfgTgcDmAs3YAKRP86S+8MJYjSGGoQZTEUIUpiqEKUw1CGKIWhDlEGIwJECYwoEOkxIkGkxogGkRYjIkRKjKgQ6TAiQ6TCiA6RBiMDRAqMLBDhMTJBhMbIBhEWIyNESIysEOEwMkOEwsgOEQajAkQIjCoQ8hiVIKQxqkHIYlSEkMSoCiGHURlCCqM6hAwGED2FwFcCgPiC2BwDiB+ITTGA+AuxGQYQ9xCbYADxGGJ1DCCeQ6yKAcQ4xGoYQExDrIIBxGsQi2MA8TrEohhAzINYDAOI+RCLYADRBuGOAUQ7hCsGEDYINwwg7BB9wt76b2RTED5jxks5n8+zhzb93hQQs/sevaEZA4jRXpsWmzCAaOp68qbZGEBMdtp8gfkDvPmZufGugdk74y6BE24NgOFWpT0IDHuHbglguFVpDwLD3qFbAhhuVdqDwLB36JYAhluV9iAw7B26JYDhVqU9CAx7h24JYLhVaQ8Cw96hWwIYblXag8Cwd+iWAIZblfYgMOwduiWA4ValPQgMe4duCWC4VWkP+gB0Q28kIlEY8gAAAABJRU5ErkJggg=="
      />
    </defs>
  </svg>
);

export default memo(AngleIcon);
