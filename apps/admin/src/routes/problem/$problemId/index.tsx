import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/problem/$problemId/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>{`Hello "/problem/$problemId/"!`}</div>;
}
