import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_GNBLayout/teacher/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_GNBLayout/teacher/"!</div>;
}
