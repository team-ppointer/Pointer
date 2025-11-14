import { createFileRoute } from '@tanstack/react-router';
import { Modal, TwoButtonModalTemplate, ProgressModal, Header } from '@components';
import { HTMLAttributes, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { deletePublish, getPublish, getPublishById } from '@apis';
import { useInvalidate, useModal, useSelectedStudent } from '@hooks';
import { components } from '@schema';
import dayjs from 'dayjs';
import {
  Trash2,
  BarChart3,
  Plus,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  UserCircle,
  AlertCircle,
  Folder,
  Package,
} from 'lucide-react';

import 'dayjs/locale/ko';

dayjs.locale('ko');

interface DayProps extends HTMLAttributes<HTMLDivElement> {
  fullDate: string;
  day: number;
  dayOfWeek?: number; // 요일 - 0: Sunday ~ 6: Saturday
  publishId?: number;
  title?: string;
  setId?: number;
  selectedStudent?: components['schemas']['StudentResp'] | null;
}

const Day = ({ fullDate, day, dayOfWeek, publishId, title, setId, selectedStudent }: DayProps) => {
  const { invalidatePublish } = useInvalidate();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();
  const {
    isOpen: isProgressModalOpen,
    openModal: openProgressModal,
    closeModal: closeProgressModal,
  } = useModal();
  const { mutate: mutateDeletePublish } = deletePublish();
  const { data: publishDetailData } = getPublishById({ id: publishId || 0 });

  const today = dayjs().startOf('day');
  // const isPast = dayjs(fullDate).isBefore(today, 'day');
  const isToday = dayjs(fullDate).isSame(today, 'day');
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;

  const dayOfWeekStyle = isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-gray-900';

  const todayBgStyle = isToday
    ? isSunday
      ? 'bg-red-100'
      : isSaturday
        ? 'bg-blue-100'
        : 'bg-[var(--color-main)]/10 text-main'
    : 'bg-white';

  const handleMutateDelete = () => {
    if (!publishId) return;
    mutateDeletePublish(
      {
        params: {
          path: {
            id: publishId,
          },
        },
      },
      {
        onSuccess: () => {
          invalidatePublish(dayjs(fullDate).year(), dayjs(fullDate).month() + 1);
          closeDeleteModal();
        },
      }
    );
  };

  const isPast = dayjs(fullDate).isBefore(today, 'day');
  const canPublish = !isPast || isToday;

  return (
    <>
      <div className='group relative flex h-[160px] flex-col overflow-hidden bg-white transition-all duration-200'>
        {/* Date Header */}
        <div className='flex items-center justify-between p-2'>
          <div
            className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 font-bold transition-all duration-200 ${dayOfWeekStyle} ${todayBgStyle}`}>
            <span className='text-sm'>{day}</span>
          </div>
          {/* Action Buttons */}
          {title && selectedStudent && (
            <div className='flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
              <button
                type='button'
                onClick={openProgressModal}
                className='flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                <BarChart3 className='h-3.5 w-3.5' />
              </button>
              <button
                type='button'
                onClick={openDeleteModal}
                className='flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-50'>
                <Trash2 className='h-3.5 w-3.5' />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className='flex flex-1 flex-col px-4 py-1'>
          {title && setId ? (
            <Link
              to={'/problem-set/$problemSetId'}
              params={{ problemSetId: setId.toString() }}
              className='group/link flex flex-col gap-2'>
              <div className='flex items-start gap-1.5'>
                <Package className='text-main mt-0.5 h-4 w-4 flex-shrink-0' />
                <p className='group-hover/link:text-main line-clamp-3 text-sm font-semibold text-gray-900 transition-colors'>
                  {title}
                </p>
              </div>
            </Link>
          ) : selectedStudent && canPublish ? (
            <Link
              to={`/publish/register/$publishDate/$studentId`}
              params={{
                publishDate: fullDate,
                studentId: selectedStudent.id.toString(),
              }}
              className='flex h-full items-center justify-center'>
              <div className='flex flex-col items-center gap-2 text-center'>
                <div className='group-hover:border-main group-hover:bg-main/10 flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 transition-all duration-200'>
                  <Plus className='group-hover:text-main h-5 w-5 text-gray-400 transition-colors duration-200' />
                </div>
                <span className='text-xs font-medium text-gray-500 opacity-0 transition-opacity group-hover:opacity-100'>
                  발행
                </span>
              </div>
            </Link>
          ) : !selectedStudent ? (
            <div className='flex h-full items-center justify-center text-center'>
              <div className='flex flex-col items-center gap-2'>
                <UserCircle className='h-8 w-8 text-gray-300' />
                <span className='text-xs text-gray-400'>학생 선택 필요</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text={`${dayjs(fullDate).format('M월 D일')}의 발행을 취소할까요?`}
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={handleMutateDelete}
        />
      </Modal>
      {publishDetailData && publishId && (
        <Modal isOpen={isProgressModalOpen} onClose={closeProgressModal}>
          <ProgressModal publishData={publishDetailData} onClose={closeProgressModal} />
        </Modal>
      )}
    </>
  );
};

export const Route = createFileRoute('/_GNBLayout/publish/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const { selectedStudent } = useSelectedStudent();

  const handleClickPrevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const handleClickNextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));
  const handleClickCurrentMonth = () => setCurrentMonth(dayjs().startOf('month'));

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.startOf('month').day(); // 1일 요일, 0: Sunday ~ 6: Saturday
  const lastDayOfMonth = currentMonth.endOf('month').day(); // 마지막날 요일, 0: Sunday ~ 6: Saturday
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const { data: publishDataResponse } = getPublish({
    year: currentMonth.year(),
    month: currentMonth.month() + 1,
    studentId: selectedStudent?.id,
  });
  const publishData = publishDataResponse?.data ?? [];

  // 통계 계산
  const totalPublished = publishData.length;
  const thisMonthDays = daysInMonth;

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <Header title='발행'>
        <div className='flex items-center justify-center gap-4'>
          <button
            type='button'
            onClick={handleClickPrevMonth}
            className='flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-all duration-200 hover:bg-gray-100'>
            <ChevronLeft className='h-5 w-5' />
          </button>
          <span className='text-2xl font-bold text-gray-900'>
            {currentMonth.format('YYYY년 M월')}
          </span>
          <button
            type='button'
            onClick={handleClickNextMonth}
            className='flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition-all duration-200 hover:bg-gray-100'>
            <ChevronRight className='h-5 w-5' />
          </button>
        </div>
      </Header>

      <div className='mx-auto max-w-7xl px-8 py-8'>
        {/* Student Alert */}
        {!selectedStudent && (
          <div className='mb-6 flex items-start gap-4 rounded-xl border border-amber-200 bg-amber-50 p-6'>
            <AlertCircle className='mt-0.5 h-6 w-6 flex-shrink-0 text-amber-600' />
            <div>
              <h3 className='mb-1 text-lg font-bold text-amber-900'>학생을 선택해주세요</h3>
              <p className='text-sm text-amber-700'>
                사이드바에서 학생을 선택하시면 해당 학생의 발행 일정을 관리할 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* Calendar Navigation */}

        {/* Calendar */}
        <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white'>
          {/* Day of Week Header */}
          <div className='grid grid-cols-7 border-b border-gray-200 bg-gray-50'>
            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
              <div
                key={day}
                className={`py-4 text-center text-sm font-bold ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700'
                }`}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className='grid grid-cols-7 gap-[1px] bg-gray-200'>
            {firstDayOfMonth > 0 && (
              <div
                className={`h-[160px] w-full grid-cols-7 gap-[1px] bg-gray-100 ${['col-span-0', 'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5', 'col-span-6'][firstDayOfMonth]}`}
              />
            )}

            {daysArray.map((day) => {
              const currentDate = currentMonth.date(day);
              const fullDate = currentDate.format('YYYY-MM-DD');
              const dayOfWeek = currentDate.day();
              const setData = publishData.find((e) => e.publishAt === fullDate);

              return (
                <Day
                  key={day}
                  day={day}
                  dayOfWeek={dayOfWeek}
                  fullDate={fullDate}
                  publishId={setData?.id}
                  title={setData?.problemSet?.title}
                  setId={setData?.problemSet?.id}
                  selectedStudent={selectedStudent}
                />
              );
            })}

            {lastDayOfMonth < 6 && (
              <div
                className={`h-[160px] w-full grid-cols-7 gap-[1px] bg-gray-100 ${['col-span-0', 'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5', 'col-span-6'][6 - lastDayOfMonth]}`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
