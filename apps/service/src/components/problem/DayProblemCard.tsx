import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { Button, SolveButton, Tag } from '@components';
import { IcSolve } from '@svg';

dayjs.locale('ko');

interface DayProblemCardProps {
  date: dayjs.Dayjs;
  selectedDay: number;
}

const DayProblemCard = ({ date, selectedDay }: DayProblemCardProps) => {
  const month = date.month() + 1;
  const day = selectedDay;
  const dayOfWeek = date.date(day).format('dd');

  return (
    <div className='flex max-h-full w-full flex-col justify-between rounded-[16px] bg-white px-[3.2rem] py-[2.4rem]'>
      <div>
        <div className='flex items-center justify-between gap-[1.2rem]'>
          <p className='font-medium-16 text-main'>{`${month}월 ${day}일 ${dayOfWeek}요일`}</p>
          <Tag variant='red' sizeType='small'>
            진행중
          </Tag>
        </div>
        <div className='bg-lightgray300 my-[1.6rem] h-[2px] w-full' />
        <div className='flex gap-[2.4rem]'>
          <ul className='flex h-full flex-col gap-[1.6rem]'>
            {[
              {
                num: 1,
                status: '완료',
              },
              {
                num: 2,
                status: '진행중',
              },
              {
                num: 3,
                status: '미완료',
              },
            ].map((problem, index) => (
              <li
                key={index}
                className='flex w-[15.7rem] items-center justify-between gap-[0.8rem]'>
                <p className='font-medium-16 text-black'>{`메인문제 ${problem.num}번`}</p>
                <Tag variant={problem.status === '완료' ? 'green' : 'red'} sizeType='small'>
                  {problem.status}
                </Tag>
              </li>
            ))}
          </ul>
          <div className='flex flex-1 items-start justify-center'>
            <img
              src={'https://placehold.co/100x100'}
              alt='문제 이미지'
              className='max-w-[24rem] object-contain md:w-full'
            />
          </div>
        </div>
      </div>

      <Button className='mt-[2.4rem]'>
        <IcSolve width={24} height={24} />
        문제 풀러 가기
      </Button>
    </div>
  );
};

export default DayProblemCard;
