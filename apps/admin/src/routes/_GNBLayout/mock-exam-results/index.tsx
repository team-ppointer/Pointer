import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@components';

export const Route = createFileRoute('/_GNBLayout/mock-exam-results/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <Header title='모의고사 정오답 및 질문'>
        <></>
      </Header>
      <div className='mx-auto max-w-7xl px-8 py-8'>
        <p className='text-sm text-gray-500'>준비중</p>
      </div>
    </div>
  );
}
