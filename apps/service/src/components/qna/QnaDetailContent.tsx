'use client';

import ProblemViewer from '@repo/pointer-editor/ProblemViewer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { formatDateToSlash, getWeekNum } from '@utils';
import { components } from '@schema';

const QnaDetailContent = ({
  title,
  content,
  question,
  publishDate,
  images,
  user = 'student',
}: components['schemas']['QnAResp'] & { user?: 'teacher' | 'student' }) => {
  const query = images.map((u) => `imageUrl=${encodeURIComponent(u.url)}`).join('&');
  const router = useRouter();
  const weekNumber = getWeekNum(publishDate);
  const formattedDate = formatDateToSlash(publishDate);
  const titleColor = user === 'student' ? 'sub1' : 'main';
  const contentColor = user === 'student' ? 'white' : 'black';
  return (
    <div className='flex w-full flex-col gap-[1.2rem]'>
      <div className='flex w-full items-center justify-between'>
        <p className={`text-${titleColor} font-medium-12`}>{weekNumber}</p>
        <p className={`text-${titleColor} font-medium-12`}>{formattedDate} 숙제</p>
      </div>
      <Divider color={user === 'student' ? 'sub1' : 'background'} />
      <div className='flex w-full flex-col items-start justify-start gap-[0.8rem]'>
        <p className={`text-${titleColor} font-medium-12`}>해당 페이지</p>
        <p className={`font-medium-16 text-${contentColor}`}>{title}</p>
        <ProblemViewer problem={content} loading={false} />
      </div>
      <Divider color={user === 'student' ? 'sub1' : 'background'} />
      <div className='flex w-full flex-col items-start justify-start gap-[0.8rem]'>
        <p className={`text-${titleColor} font-medium-12`}>질문 내용</p>
        <span className={`font-medium-16 whitespace-pre-wrap text-${contentColor}`}>
          {question}
        </span>
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

const Divider = ({ color }: { color: string }) => {
  return <div className={`bg-${color} h-[0.2rem] w-full`} />;
};
