'use client';
import { usePathname, useRouter } from 'next/navigation';
import { ProblemViewer } from '@components';

import { Button } from '@components';
import { trackEvent } from '@utils';
import { IcSolve } from '@svg';

interface Props {
  publishId: number;
  dateString: string;
  title: string;
  problemContent: string;
  studentId?: number;
}

const ProblemCard = ({ publishId, dateString, title, problemContent, studentId }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const isTeacherPage = pathname.includes('/teacher');

  const handleClickProblem = () => {
    trackEvent('home_carousel_problem_card_click', {
      publishId,
    });
    if (isTeacherPage) {
      router.push(`/teacher/problem/${studentId}/list/${publishId}`);
      return;
    }
    router.push(`/problem/list/${publishId}`);
  };

  return (
    <article
      className={`bg-sub2 flex h-full w-full flex-col justify-between gap-[2.4rem] rounded-[16px] p-[2.4rem]`}>
      <div className='flex flex-col items-start gap-[0.8rem]'>
        <p className={`font-medium-16 text-black`}>{dateString}</p>
        <h3 className={`font-bold-20 text-main line-clamp-2`}>{title}</h3>
      </div>
      <div className='relative overflow-hidden'>
        <ProblemViewer content={problemContent} padding={24} />
        <div
          className={`from-sub2 absolute bottom-0 left-0 h-[8.9rem] w-full bg-gradient-to-t to-transparent`}
        />
      </div>
      <Button onClick={handleClickProblem}>
        <IcSolve width={24} height={24} />
        문제 풀러 가기
      </Button>
    </article>
  );
};

export default ProblemCard;
