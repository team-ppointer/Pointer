import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_GNBLayout/problem/register/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>{`Hello "/problem/register/"!`}</div>
}
