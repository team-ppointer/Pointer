import dayjs from 'dayjs';
import Link from 'next/link';
import Image from 'next/image';

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
    case 'IN_PROGRESS':
      return '진행중';
    case 'NOT_STARTED':
    default:
      return '미완료';
  }
};
const answerStatusColor = (status: string) => {
  switch (status) {
    case 'CORRECT':
    case 'RETRY_CORRECT':
    case 'INCORRECT':
      return 'green';
    case 'IN_PROGRESS':
      return 'red';
    case 'NOT_STARTED':
    default:
      return 'gray';
  }
};

type AllProblemGetResponse = components['schemas']['AllProblemGetResponse'];
interface DayProblemCardProps {
  dayProblemData: AllProblemGetResponse;
}

const DayProblemCard = ({ dayProblemData }: DayProblemCardProps) => {
  const { publishId, date, progress, problemStatuses, mainProblemImageUrl } = dayProblemData;
  const progressLabel =
    progress === 'COMPLETE' ? '완료' : progress === 'IN_PROGRESS' ? '진행중' : '미완료';
  const progressColor =
    progress === 'COMPLETE' ? 'green' : progress === 'IN_PROGRESS' ? 'red' : 'gray';

  const dayOfWeek = dayjs(date).format('ddd요일');
  const dateFormatted = dayjs(date).format('M월 DD일');

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
        <div className='flex gap-[2.4rem]'>
          <ul className='flex h-full flex-col gap-[1.6rem]'>
            {(problemStatuses ?? []).map((problem, index) => (
              <li
                key={index}
                className='flex w-[15.7rem] items-center justify-between gap-[0.8rem]'>
                <p className='font-medium-16 text-black'>{`메인문제 ${index + 1}번`}</p>
                <Tag variant={answerStatusColor(problem)} sizeType='small'>
                  {answerStatusLabel(problem)}
                </Tag>
              </li>
            ))}
          </ul>
          <div className='flex flex-1 items-start justify-center'>
            <Image
              src={mainProblemImageUrl ?? ''}
              alt='문제 이미지'
              className='w-full max-w-[20rem] object-contain'
              width={200}
              height={100}
            />
          </div>
        </div>
      </div>

      <Link href={`/problem/list/${publishId}`}>
        <Button className='mt-[3.2rem]'>
          <IcSolve width={24} height={24} />
          문제 풀러 가기
        </Button>
      </Link>
    </div>
  );
};

export default DayProblemCard;
