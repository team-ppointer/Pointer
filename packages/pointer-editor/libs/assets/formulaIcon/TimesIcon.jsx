import { memo } from "react";

const TimesIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34612)" />
    <defs>
      <pattern
        id="pattern0_296_34612"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34612"
          transform="matrix(0.0119048 0 0 0.0125661 0 -0.0340608)"
        />
      </pattern>
      <image
        id="image0_296_34612"
        width="84"
        height="85"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABVCAYAAADXN8NkAAABYWlDQ1BJQ0MgUHJvZmlsZQAAKJFtkD1Lw3AQxp/U1oKKFNFFHLI4CPWFWgXdaqu1kCG01jcQTNM0LTTp3zQiipsufgERP4CDuNexmx9AUXR2cROELlri/RO1rXpwPD8e7o67A3whhbGyH4Bh2lY6uSCub2yKwRd0YwBDmEREUassJssSleBbO6NxD4Hr7TifdZKYCxSOHg8vK/2L56sH2b/1HdGT16oq6QflrMosGxCixPKezTgfEw9atBTxGWfd4yvOOY/rbs1KOk58RxxSi0qe+Jk4nGvz9TY2yrvq1w58+z7NzGZIhylHICEJESnIyJAuIUuOhGUk6E//90XdvjgqYNiHhRJ0FGFTd4wchjI0d6IJFRMIE0cwRTnD//37jy1vh+6bTwE+o+Vty8D1Kz+z5Y2GaZUboL7FFEv5+a7Q8FcL0xGPe2tA4NRx3taA4BjQfHCc95rjNC+ArifqbXwCaMdi6VFEISgAAABWZVhJZk1NACoAAAAIAAGHaQAEAAAAAQAAABoAAAAAAAOShgAHAAAAEgAAAESgAgAEAAAAAQAAAFSgAwAEAAAAAQAAAFUAAAAAQVNDSUkAAABTY3JlZW5zaG90xe5GWQAAAdRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDYuMC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+ODU8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+ODQ8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpVc2VyQ29tbWVudD5TY3JlZW5zaG90PC9leGlmOlVzZXJDb21tZW50PgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KIMxenQAAAzVJREFUeAHt2o2N4jAQBWD2iqEaqIY6qAaqoZm7eydZh7zYTub3ZTWWUDZZbM98cmIn4ev333KqYibwy6ylauifQIEaD4QCLVBjAePmaoQWqLGAcXM1QgvUWMC4uRqhBWosYNxcjdACNRYwbk41Qp/P5+n1ehmHlNccctHmIwYF5uPxON3vd3UQeYT/ewYkctHmIwJtmC0cbRCtnaxtw2z9a/LZDdpjWgTR2sjY9pgtBinqbtDz+dz6/LaVBvGtoaADI0x0jzxnuY5C/JI8sZ8Fgo5ut5somFGQHsdHZxr6AiRykJTdI3RLh+wj1QsTNiLQI6N6YqpAj4jqjakGPRJqBKYJ6BFQozDNQJlRIzHhIFo2oeKoMC2pZpjX6/V0uVxGaYiPi2f5UY+rNVzUkioDEybmoGg0GzUL0w00EzUT0xU0AzUb0x00EpUBMwQ0ApUFMwzUE5UJMxTUA5UNMxzUEpURMwXUApUVMw1Ug8qMmQoqQWXHRE7mD0fQ6N6y5YEKvoPfAXwqXg86PvW1OkYBiiBXqKNEmDARo8vDkVHys+OrByqf6rJhIkYaUASzB5URkw50KyorJiUogsL1dFYwOa2+M6vv+T+qUx6JzpZG7xBRT/7f+9zyNxXoVsyWGCMqDegME5PVqLChUoDOMDEB4Ydbsx9vMaGmg64w26ve1ZKKBTX1TmmGMFoare6osn9KmTZCJZi4jrKP1BRQKWabmJhRw0G1mOyooaBWmMyoYaDWmKyoIaBemIyo7qDemGyorqBRmEyobqDRmCyoLndKM8yoO5msOyrzEcqAidGatfg3BWXBzDz9zUDZMLNQTUBZMTNQVZMSLvyzF2ZRE1CDW20jJioxaERwKyDJ/73jFp3y3kFJoLbW8Z79d4MeGbOhe6KKQFtg/ZbtmtnH976/QsXAkZTdoHhphvc9fTkSZot9hDp6n9Xqzba7QdFYj3pEzIbSo2ow0aZ4lkdlvAJGQPgcveAUx6e9tpbmowKVdvqT64lO+Z8Mos2tQLWCXf0C7UC0uwWqFezqF2gHot0tUK1gV79AOxDtboFqBbv6BdqBaHcLVCvY1S/QDkS7W6Bawa7+H3QAv0h23qScAAAAAElFTkSuQmCC"
      />
    </defs>
  </svg>
);

export default memo(TimesIcon);
