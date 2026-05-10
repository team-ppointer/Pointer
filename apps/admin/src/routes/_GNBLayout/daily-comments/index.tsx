import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@components';

export const Route = createFileRoute('/_GNBLayout/daily-comments/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <Header title='당신만을 위한 코멘트'>
        <></>
      </Header>
      <div className='mx-auto max-w-7xl px-8 py-8'>
        <p className='text-sm text-gray-500'>준비중</p>
      </div>
    </div>
  );
}
