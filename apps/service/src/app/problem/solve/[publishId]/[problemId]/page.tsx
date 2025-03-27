import { getProblemThumbnail } from '@apis';
import { ProgressHeader, TimeTag } from '@components';

import SolveButtonsClient from './SolveButtonsClient';

const Page = async ({ params }: { params: Promise<{ publishId: string; problemId: string }> }) => {
  const { publishId, problemId } = await params;

  const { number, imageUrl, recommendedMinute, recommendedSecond } = await getProblemThumbnail(
    publishId,
    problemId
  );

  return (
    <>
      <ProgressHeader progress={0} />
      <main className='p-[2rem] pt-[8rem]'>
        <div className='flex items-center justify-between'>
          <h1 className='font-bold-18 text-main'>메인 문제 {number}번</h1>
          <TimeTag minutes={recommendedMinute} seconds={recommendedSecond} />
        </div>
        <img
          src={imageUrl}
          alt={`메인 문제 ${number}번`}
          className='mt-[1.2rem] w-full object-contain'
        />

        <SolveButtonsClient publishId={publishId} problemId={problemId} />
      </main>
    </>
  );
};

export default Page;
