import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/problem-set/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>{`Hello "/problem-set/"!`}</div>;
}
