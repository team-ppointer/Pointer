import { memo } from "react";

const OmegaIcon = (props) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="19" height="18" fill="url(#pattern0_296_34426)" />
    <defs>
      <pattern
        id="pattern0_296_34426"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use
          xlinkHref="#image0_296_34426"
          transform="matrix(0.0133333 0 0 0.0140741 0 -0.0137037)"
        />
      </pattern>
      <image
        id="image0_296_34426"
        width="75"
        height="73"
        preserveAspectRatio="none"
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABJCAYAAAB1htvhAAABYWlDQ1BJQ0MgUHJvZmlsZQAAKJFtkD1Lw3AQxp/U1oKKFNFFHLI4CPWFWgXdaqu1kCG01jcQTNM0LTTp3zQiipsufgERP4CDuNexmx9AUXR2cROELlri/RO1rXpwPD8e7o67A3whhbGyH4Bh2lY6uSCub2yKwRd0YwBDmEREUassJssSleBbO6NxD4Hr7TifdZKYCxSOHg8vK/2L56sH2b/1HdGT16oq6QflrMosGxCixPKezTgfEw9atBTxGWfd4yvOOY/rbs1KOk58RxxSi0qe+Jk4nGvz9TY2yrvq1w58+z7NzGZIhylHICEJESnIyJAuIUuOhGUk6E//90XdvjgqYNiHhRJ0FGFTd4wchjI0d6IJFRMIE0cwRTnD//37jy1vh+6bTwE+o+Vty8D1Kz+z5Y2GaZUboL7FFEv5+a7Q8FcL0xGPe2tA4NRx3taA4BjQfHCc95rjNC+ArifqbXwCaMdi6VFEISgAAABWZVhJZk1NACoAAAAIAAGHaQAEAAAAAQAAABoAAAAAAAOShgAHAAAAEgAAAESgAgAEAAAAAQAAAEugAwAEAAAAAQAAAEkAAAAAQVNDSUkAAABTY3JlZW5zaG90Qo+qVQAAAdRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDYuMC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+NzM8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+NzU8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpVc2VyQ29tbWVudD5TY3JlZW5zaG90PC9leGlmOlVzZXJDb21tZW50PgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4K6IROyAAAA+RJREFUeAHtmo1t4zAMhdPiZkmWSebIAJkjA2SOZJlkmbt7Bl5BsJIs/vguBWiglSxTFPnpiU5/Pn7/vXZ1TRH4nLIqo4VAwTIIoWAVLAMBg2kpq2AZCBhMS1kFy0DAYFrKKlgGAgbTUlbBMhAwmJayCpaBgMG0lFWwDAQMpqWsgmUgYDD9ZbBNM329Xouv+/2+Q3+/3+8ul0vY/+PxWHwcj8ewr5aDj3/1O3hAIZxWIIAFaJHrfD5/TT+dTrtsaJsraw3SV3YJHQC/Xq+LJ2wMrkxgmxZ4HAsEz2O3RL/hNygTiuIFYDyaHIu0m8ACHEDi7q4FiASjR5BraCWNjj7nzLbpsAjKoqYsUExaqgtjPJp87m1TaxYkP6smHplsUADR8onYtOqs0NJgQUlroLYEJBPHOviS6kZsbwNrJHXWpNaOyyQz+1hTxwR4kRhSlNV74yAwgrKCQGJSGVFVYH2oK/LhNwyrV6cAyZsgFCFByURnlQE7fEk/sm/dPNinvw3hNAIK8HtJ9cax5uwV8RGC1VJVBBQSHr0kvEqdBblmF4KlnUP2kYR6tU+vM3t/OBy+mf43ZWkVQFWR6/l8dqdHfdPxaA3a9Fq3srQKkMxs8e0FE9n1ns/McTeszCDgS8PX/iPHW/vy3rthaTlvmUzWEfRC4jw3LHlkMpLR9Y8Bos3ciFbRl2uN+i5YEtTIecazjI3IiAM+XLD04lsW9oiqdKnQcVvvXbC0sraCFVWVjtMKR9u7YGknW91HVNV7u0Z8vi2sqKq22MC3gNWqLREFAFTr7RrdgBRY2bUhmlTvCEbV9nawAGoLVQFU1K8Lln77tY6RZRelMqO+eqqKqhX5uGBpEEhWJqyfj+7178lHtmvPAKpVq9bmzT5PgYXFrEkDbuvXx17wI1AZRxs5uv8xRP4TBhzxWgsMMLD7UomYg+PHMRxzjOnjzjVk2/Inn6N/u930kOveDaulCkaAJPkDK/pIiLWIQGiLFslgXKsTwHDBB8FxPo8b7xfDxre1zWtM6Q65/7qDIHRyXAUJrCVBWwLhvWwJRI5Z+gAcfQPK9dw1izstnVn7cteleqx+evaRvxG2fLphwVkEmATFwEYqo81smw0K64ZgeQPqHQ+MR4HBB2pgZCN7GxKCBadWYIAxmoMa4010zXcPwuy4+20oF0Ax7xV72lE1syBGn5voE63Vr5xr7afA4qL8UYMfEzCOjxBIaBYSfaGlP/S1T4x5/WKu50qF5QngJ80J16yflGw01oJlIFiwCpaBgMG0lFWwDAQMpqWsgmUgYDAtZRUsAwGDaSmrYBkIGExLWQXLQMBg+gfdjKYWA/0A4wAAAABJRU5ErkJggg=="
      />
    </defs>
  </svg>
);

export default memo(OmegaIcon);
