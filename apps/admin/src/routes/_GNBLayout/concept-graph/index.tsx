import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_GNBLayout/concept-graph/')({
  beforeLoad: () => {
    throw redirect({ to: '/concept-graph/node' });
  },
});
