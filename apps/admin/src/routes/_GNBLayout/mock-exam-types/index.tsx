import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@components';

export const Route = createFileRoute('/_GNBLayout/mock-exam-types/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <Header title='모의고사 타입 관리'>
        <></>
      </Header>
      <div className='mx-auto max-w-7xl px-8 py-8'>
        <p className='text-sm text-gray-500'>준비중</p>
      </div>
    </div>
  );
}
