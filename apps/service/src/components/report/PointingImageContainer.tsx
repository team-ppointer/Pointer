'use client';
import ProblemViewer from '@repo/pointer-editor/ProblemViewer';
import { useRouter, useSearchParams } from 'next/navigation';

import { IcCommentCheck20, IcPrescription20, IcQuestion18 } from '@svg';
import { components } from '@schema';
import { SmallButton } from '@components';
import { useReportContext } from '@/hooks/report';

type Contentype = components['schemas']['ContentResp'];

interface PointingImageContainerProps {
  contents: Contentype;
  variant: 'pointing' | 'prescription';
  pointingId: number;
}

const PointingImageContainer = ({ contents, variant, pointingId }: PointingImageContainerProps) => {
  const router = useRouter();
  const { publishId, childProblemId, type, problemId } = useReportContext();

  const handleClickQuestion = () => {
    if (type === 'child' && childProblemId) {
      const questionType =
        variant === 'pointing'
          ? 'CHILD_PROBLEM_POINTING_QUESTION'
          : 'CHILD_PROBLEM_POINTING_COMMENT';
      router.push(
        `/qna/ask?publishId=${publishId}&childProblemId=${problemId}&pointingId=${pointingId}&type=${questionType}`
      );
      return;
    }
    if (type === 'main') {
      const questionType =
        variant === 'pointing' ? 'PROBLEM_POINTING_QUESTION' : 'PROBLEM_POINTING_COMMENT';
      router.push(
        `/qna/ask?publishId=${publishId}&problemId=${problemId}&pointingId=${pointingId}&type=${questionType}`
      );
      return;
    }
  };
  return (
    <div>
      <div className='flex justify-between'>
        <div className='flex items-center gap-[0.8rem]'>
          {variant === 'pointing' ? (
            <IcCommentCheck20 width={20} height={20} />
          ) : (
            <IcPrescription20 width={20} height={20} />
          )}
          <h3 className='font-bold-16 text-main'>{variant === 'pointing' ? '포인팅' : '처방'}</h3>
        </div>
        <SmallButton
          className='flex flex-row gap-[4px]'
          variant='white'
          sizeType='small'
          onClick={handleClickQuestion}>
          <IcQuestion18 className='h-[1.8rem] w-[1.8rem]' />
          질문하기
        </SmallButton>
      </div>
      <ProblemViewer problem={contents} />
    </div>
  );
};

export default PointingImageContainer;
