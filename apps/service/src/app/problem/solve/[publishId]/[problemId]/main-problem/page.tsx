import { getProblemById } from '@apis';
import {
  AnswerInput,
  Button,
  NavigationFooter,
  ProgressHeader,
  SmallButton,
  Tag,
  TimeTag,
} from '@components';

const statusLabel: Record<string, string> = {
  CORRECT: '정답',
  INCORRECT: '오답',
  RETRY_CORRECT: '정답',
  NOT_STARTED: '시작전',
};

const statusColor: Record<string, 'green' | 'red' | 'gray'> = {
  CORRECT: 'green',
  INCORRECT: 'red',
  RETRY_CORRECT: 'green',
  NOT_STARTED: 'gray',
};

const Page = async ({ params }: { params: Promise<{ publishId: string; problemId: string }> }) => {
  const { publishId, problemId } = await params;
  const mainProblem = await getProblemById(publishId, problemId);

  return (
    <>
      <ProgressHeader progress={10} />
      <main className='flex flex-col px-[2rem] py-[8rem] md:flex-row md:gap-[4rem]'>
        <div className='w-full'>
          <div className='flex items-center justify-between'>
            <h1 className='font-bold-18 text-main'>메인 문제 {mainProblem?.number}번</h1>
            <TimeTag
              minutes={mainProblem?.recommendedMinute}
              seconds={mainProblem?.recommendedSecond}
            />
          </div>
          <img
            src={mainProblem?.imageUrl}
            alt={`메인 문제 ${mainProblem?.number}번`}
            className='mt-[1.2rem] w-full object-contain'
          />

          <div className='mt-[0.6rem] flex items-center justify-end'>
            <SmallButton variant='underline' sizeType='small'>
              단계별로 풀어보기
            </SmallButton>
          </div>
        </div>

        <div className='mt-[2.4rem] w-full'>
          <h3 className='font-bold-16 text-black'>새끼 문제 정답</h3>
          <div className='mt-[1.2rem] flex gap-[1.6rem]'>
            {mainProblem?.childProblemStatuses?.map((childProblemStatus, index) => (
              <div key={index} className='flex items-center gap-[0.6rem]'>
                <span className='font-medium-16 text-black'>
                  {mainProblem.number}-{index + 1}번
                </span>
                <Tag variant={statusColor[childProblemStatus]}>
                  {statusLabel[childProblemStatus]}
                </Tag>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-[2.8rem] w-full'>
          <h3 className='font-bold-16 text-black'>정답 선택</h3>
          <div className='mt-[1.2rem] flex flex-col gap-[2rem] lg:flex-row'>
            <AnswerInput answerType='MULTIPLE_CHOICE' selectedAnswer='' />
            <Button>제출하기</Button>
          </div>
        </div>
      </main>
      <NavigationFooter prevLabel='이전' nextLabel='다음' />
    </>
  );
};

export default Page;
