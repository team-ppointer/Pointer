import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/publish/search/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>{`Hello "/publish/search/"!`}</div>;
}
