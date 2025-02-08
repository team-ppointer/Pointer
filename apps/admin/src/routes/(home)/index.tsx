import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(home)/')({
  component: HomeComponent,
});

function HomeComponent() {
  return <div>home</div>;
}
