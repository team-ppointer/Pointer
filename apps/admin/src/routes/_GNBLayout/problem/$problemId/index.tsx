import { Header } from '@components';
import { createFileRoute } from '@tanstack/react-router';
import { ReactNode } from 'react';

export const Route = createFileRoute('/_GNBLayout/problem/$problemId/')({
  component: RouteComponent,
});

const SectionLayout = ({ children }: { children: ReactNode }) => {
  return (
    <section className='border-lightgray500 w-full rounded-[1.6rem] border bg-white p-[3.2rem]'>
      {children}
    </section>
  );
};

function RouteComponent() {
  const { problemId } = Route.useParams();
  return (
    <>
      <Header title={`문항 ID : ${problemId}`} />
      <SectionLayout>
        <div className='flex items-baseline gap-[1.6rem]'>
          <h3 className='font-bold-32 text-black'>새끼 문제 등록</h3>
          <p className='font-medium-14 text-lightgray500'>
            새끼 문항은 저장 후 항목 추가가 불가능해요
          </p>
        </div>
      </SectionLayout>
    </>
  );
}
