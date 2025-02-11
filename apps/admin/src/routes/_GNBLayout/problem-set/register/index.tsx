import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_GNBLayout/problem-set/register/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>{`Hello "/problem-set/register/"!`}</div>;
}
