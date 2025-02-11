import { Header } from '@components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_GNBLayout/problem/register/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Header title='문항 등록' />
    </>
  );
}
