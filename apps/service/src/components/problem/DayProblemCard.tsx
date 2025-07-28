import dayjs from 'dayjs';
import Link from 'next/link';
import ProblemViewer from '@repo/pointer-editor/ProblemViewer';

import { Button, Divider, Tag } from '@components';
import { IcSolve } from '@svg';
import { components } from '@schema';

import 'dayjs/locale/ko';

dayjs.locale('ko');

const answerStatusLabel = (status: string) => {
  switch (status) {
    case 'CORRECT':
    case 'RETRY_CORRECT':
    case 'INCORRECT':
      return '완료';
    case 'DOING':
      return '진행중';
    case 'NONE':
    default:
      return '미완료';
  }
};
const answerStatusColor = (status: string) => {
  switch (status) {
    case 'DONE':
      return 'green';
    case 'DOING':
      return 'red';
    case 'NONE':
    default:
      return 'gray';
  }
};

type AllProblemGetResponse = components['schemas']['PublishResp'];

const DayProblemCard = ({ dayProblemData }: { dayProblemData: AllProblemGetResponse }) => {
  const { id, publishAt, progress, problemSet, data } = dayProblemData;

  const progressLabel = progress === 'DONE' ? '완료' : progress === 'DOING' ? '진행중' : '미완료';
  const progressColor = progress === 'DONE' ? 'green' : progress === 'DOING' ? 'red' : 'gray';

  const dayOfWeek = dayjs(publishAt).format('ddd요일');
  const dateFormatted = dayjs(publishAt).format('M월 DD일');

  return (
    <div className='flex max-h-full w-full flex-col justify-between rounded-[16px] bg-white px-[3.2rem] py-[2.4rem]'>
      <div className='flex flex-col gap-[1.6rem]'>
        <div className='flex items-center justify-between gap-[1.2rem]'>
          <p className='font-bold-18 text-main'>{`${dateFormatted} ${dayOfWeek}`}</p>
          <Tag variant={progressColor} sizeType='small'>
            {progressLabel}
          </Tag>
        </div>
        <Divider />
        <div className='flex flex-row gap-[2.4rem]'>
          <ul className='flex h-full flex-col gap-[1.6rem]'>
            {/* problemSet이 배열인 경우 */}
            {data.map((problem) => (
              <li
                key={problem.no}
                className='flex w-[15.7rem] items-center justify-between gap-[0.8rem]'>
                <p className='font-medium-16 text-black'>{`메인문제 ${problem.no}번`}</p>
                <Tag variant={answerStatusColor(problem.progress)} sizeType='small'>
                  {answerStatusLabel(problem.progress)}
                </Tag>
              </li>
            ))}
          </ul>
          <div className='flex w-full flex-col items-center justify-center rounded-[1.6rem] bg-white'>
            <ProblemViewer problem={problemSet.firstProblem.problemContent} loading={false} />
          </div>
        </div>
      </div>

      <Link href={`/problem/list/${id}`}>
        <Button className='mt-[3.2rem]'>
          <IcSolve width={24} height={24} />
          문제 풀러 가기
        </Button>
      </Link>
    </div>
  );
};

export default DayProblemCard;
