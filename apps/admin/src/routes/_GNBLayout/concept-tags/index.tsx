import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_GNBLayout/concept-tags/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_GNBLayout/concept-tags/"!</div>;
}
