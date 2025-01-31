import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/problem/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>{`Hello "/problem/"!`}</div>;
}
