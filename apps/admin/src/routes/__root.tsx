import { createRootRoute } from '@tanstack/react-router';
import { RootLayout } from '@layouts';

export const Route = createRootRoute({
  component: () => {
    return <RootLayout />;
  },
});
