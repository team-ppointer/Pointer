import { createFileRoute } from '@tanstack/react-router';
import { IconButton, Modal, PlusButton, TwoButtonModalTemplate } from '@components';
import { HTMLAttributes, useState } from 'react';
import { IcDeleteSm } from '@svg';
import { Link } from '@tanstack/react-router';
import { $api, deletePublish, getPublish } from '@apis';
import { useModal } from '@hooks';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import 'dayjs/locale/ko';
dayjs.locale('ko');

interface DayProps extends HTMLAttributes<HTMLDivElement> {
  fullDate: string;
  day: number;
  dayOfWeek?: number; // 요일 - 0: Sunday ~ 6: Saturday
  publishId?: number;
  title?: string;
  setId?: number;
}

const Day = ({ fullDate, day, dayOfWeek, publishId, title, setId }: DayProps) => {
  const queryClient = useQueryClient();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();
  const { mutate: mutateDeletePublish } = deletePublish();

  const today = dayjs().startOf('day');
  const isPast = dayjs(fullDate).isBefore(today, 'day');
  const isToday = dayjs(fullDate).isSame(today, 'day');
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;

  const dayOfWeekStyle = isSunday ? 'text-red' : isSaturday ? 'text-blue' : 'black';

  const todayBgStyle = isToday
    ? isSunday
      ? 'bg-lightred'
      : isSaturday
        ? 'bg-lightblue'
        : 'bg-lightgray500'
    : 'bg-white';

  const handleMutateDelete = () => {
    if (!publishId) return;
    mutateDeletePublish(
      {
        params: {
          path: {
            publishId: publishId,
          },
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: $api.queryOptions('get', '/api/v1/publish/{year}/{month}', {
              params: {
                path: {
                  year: dayjs(fullDate).year(),
                  month: dayjs(fullDate).month() + 1,
                },
              },
            }).queryKey,
          });
          closeDeleteModal();
        },
      }
    );
  };

  return (
    <>
      <div
        className={`flex h-[15rem] flex-col items-end gap-[0.4rem] rounded-[4px] bg-white px-[2.4rem] py-[1.6rem]`}>
        <div className='flex w-full items-center justify-between'>
          <div
            className={`font-medium-16 h-[2.4rem] rounded-[0.4rem] px-[0.6rem] text-black ${dayOfWeekStyle} ${todayBgStyle}`}>
            {day}
          </div>
          <div>
            {title && !isPast && (
              <div className='cursor-pointer' onClick={openDeleteModal}>
                <IcDeleteSm width={24} height={24} />
              </div>
            )}
          </div>
        </div>

        {title && setId ? (
          <Link
            to={'/problem-set/$problemSetId'}
            params={{ problemSetId: setId.toString() }}
            className='w-full overflow-auto'>
            <p className={`font-bold-18 h-full w-full text-black`}>{title}</p>
          </Link>
        ) : (
          !isPast && (
            <Link
              to={`/publish/register/$publishDate`}
              params={{ publishDate: fullDate }}
              className='flex h-full w-full flex-col items-center justify-center'>
              <PlusButton variant='dark' />
            </Link>
          )
        )}
      </div>
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text={`${fullDate}의 발행을 취소할까요?`}
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={handleMutateDelete}
        />
      </Modal>
    </>
  );
};

export const Route = createFileRoute('/_GNBLayout/publish/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));

  const handleClickPrevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const handleClickNextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));
  const handleClickCurrentMonth = () => setCurrentMonth(dayjs().startOf('month'));

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.startOf('month').day(); // 1일 요일, 0: Sunday ~ 6: Saturday
  const lastDayOfMonth = currentMonth.endOf('month').day(); // 마지막날 요일, 0: Sunday ~ 6: Saturday
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const { data: publishDataResponse } = getPublish(currentMonth.year(), currentMonth.month() + 1);
  const publishData = publishDataResponse?.data ?? [];

  return (
    <>
      <div className='w-full'>
        <div className='mb-[7.4rem] flex items-center justify-center gap-[4.8rem]'>
          <IconButton variant='left' onClick={handleClickPrevMonth} />
          <h2 className='font-bold-32 cursor-pointer' onClick={handleClickCurrentMonth}>
            {currentMonth.format('YYYY년 M월')}
          </h2>
          <IconButton variant='right' onClick={handleClickNextMonth} />
        </div>

        <div className='font-medium-18 grid grid-cols-7 text-center'>
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <div
              key={day}
              className={`py-[1.45rem] ${index === 0 ? 'text-red' : index === 6 ? 'text-blue' : ''}`}>
              {`${day}요일`}
            </div>
          ))}
        </div>

        <div className='grid grid-cols-7 gap-[0.8rem]'>
          {Array.from({ length: firstDayOfMonth }).map((_) => {
            return <div className='h-[15rem] rounded-[4px] bg-white'></div>;
          })}

          {daysArray.map((day) => {
            const currentDate = currentMonth.date(day);
            const fullDate = currentDate.format('YYYY-MM-DD');
            const dayOfWeek = currentDate.day();
            const setData = publishData.find((e) => e.date === fullDate);

            return (
              <Day
                key={day}
                day={day}
                dayOfWeek={dayOfWeek}
                fullDate={fullDate}
                publishId={setData?.publishId}
                title={setData?.problemSetInfo?.title}
                setId={setData?.problemSetInfo?.id}
              />
            );
          })}

          {Array.from({ length: 6 - lastDayOfMonth }).map((_) => {
            return <div className='h-[15rem] rounded-[4px] bg-white'></div>;
          })}
        </div>
      </div>
    </>
  );
}
