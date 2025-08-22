'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGetDiagnosis } from '@/apis/controller/home';
import { components } from '@schema';

const DiagnosisCard = ({
  item,
  index,
}: {
  item: components['schemas']['DiagnosisResp'];
  index: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className='flex w-full cursor-pointer flex-col gap-[0.2rem] rounded-xl border border-gray-100 bg-gray-50 p-[1.6rem] transition-all duration-200'
      onClick={() => setIsExpanded(!isExpanded)}>
      <div className='flex items-center justify-between'>
        <span className='font-medium-14 text-midgray100'>
          {item.createdAt && new Date(item.createdAt).toLocaleDateString()}
        </span>
        <div
          className={`flex-shrink-0 transition-transform duration-200 ${
            isExpanded ? 'rotate-270' : 'rotate-90'
          }`}>
          <svg
            className='h-[1.8rem] w-[1.8rem]'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'>
            <path
              d='M9 18L15 12L9 6'
              stroke='#9CA3AF'
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </div>
      </div>
      <span
        className={`font-medium-16 text-black ${
          isExpanded ? '' : 'overflow-hidden text-ellipsis whitespace-nowrap'
        }`}>
        {item.content}
      </span>
    </div>
  );
};

const Page = () => {
  const router = useRouter();
  const diagnosis = useGetDiagnosis().data;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      onClick={() => router.back()}>
      <div className='absolute h-full w-full bg-black opacity-50' />
      <div
        className='absolute right-0 bottom-0 left-0 flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-t-[2.0rem] bg-white p-[2.0rem]'
        style={{
          scrollSnapType: 'x mandatory',
        }}
        onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-[0.6rem]'>
            <h1 className='font-bold-20 text-black'>진단 결과</h1>
            <h2 className='font-medium-14 text-midgray100'>총 {diagnosis?.total ?? 0}개</h2>
          </div>
          {/* CLOSE ICON */}
          <button className='-mr-[0.6rem] flex-shrink-0 p-[1.2rem]' onClick={() => router.back()}>
            <svg
              className='h-[1.8rem] w-[1.8rem]'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'>
              <path
                d='M18 6L6 18'
                stroke='#9CA3AF'
                strokeWidth={2}
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M6 6L18 18'
                stroke='#9CA3AF'
                strokeWidth={2}
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>
        <div className='mt-[1.8rem] flex flex-col gap-[1.0rem]'>
          {diagnosis?.data?.map((item, index) => (
            <DiagnosisCard key={item.id} item={item} index={index} />
          ))}
          {!diagnosis || diagnosis.data.length === 0 && (
            <div className='flex items-center justify-center p-[4.8rem]'>
              <span className='font-medium-14 text-midgray100'>진단 결과가 없어요</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
