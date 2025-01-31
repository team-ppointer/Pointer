import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/publish/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>{`Hello "/publish/"!`}</div>;
}
