'use client';

import ProblemViewer from '@repo/pointer-editor/ProblemViewer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { formatDateToSlash, getWeekNum } from '@/utils/common/qna/getWeeknum';
import { components } from '@schema';

const QnaDetailContent = ({
  title,
  content,
  question,
  publishDate,
  images,
}: components['schemas']['QnAResp'] & { modifyMode: boolean }) => {
  const query = images.map((u) => `imageUrl=${encodeURIComponent(u.url)}`).join('&');
  const router = useRouter();
  const weekNumber = getWeekNum(publishDate);
  const formattedDate = formatDateToSlash(publishDate);
  return (
    <div className='flex w-full flex-col gap-[1.2rem]'>
      <div className='flex w-full items-center justify-between'>
        <p className='text-sub1 font-medium-12'>{weekNumber}</p>
        <p className='text-sub1 font-medium-12'>{formattedDate}</p>
      </div>
      <Divider />
      <div className='flex w-full flex-col items-start justify-start gap-[0.8rem]'>
        <p className='text-sub1 font-medium-12'>해당 페이지</p>
        <p className='font-medium-16 text-white'>{title}</p>
        <ProblemViewer problem={content} loading={false} />
      </div>
      <Divider />
      <div className='flex w-full flex-col items-start justify-start gap-[0.8rem]'>
        <p className='text-sub1 font-medium-12'>질문 내용</p>
        <span className='font-medium-16 text-white'>{question}</span>
        <div className='flex w-full flex-wrap items-start justify-start gap-[0.4rem]'>
          {images &&
            images.length > 0 &&
            images.map((image, index) => (
              <Image
                key={index}
                src={image.url}
                alt={`질문 이미지 ${index + 1}`}
                className='h-[8.6rem] w-[8.6rem] rounded-[0.8rem] object-cover'
                width={86}
                height={86}
                onClick={() => router.push(`/images-modal?${query}&index=${index}`)}
              />
            ))}
        </div>
      </div>
    </div>
  );
};
export default QnaDetailContent;

const Divider = () => {
  return <div className='bg-sub1 h-[0.2rem] w-full' />;
};
