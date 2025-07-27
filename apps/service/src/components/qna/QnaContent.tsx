import ProblemViewer from '@repo/pointer-editor/ProblemViewer';
import Image from 'next/image';

import { ImageContainer } from '@components';
import { components } from '@schema';

type QnaContentProps = {
  type: string;
  pointingId?: number;
  data: components['schemas']['ProblemWithStudyInfoResp'] &
    components['schemas']['ChildProblemWithStudyInfoResp'];
};

const QnaContent = ({ type, pointingId, data }: QnaContentProps) => {
  // data가 없으면 빈 div 반환
  if (!data) {
    return <div></div>;
  }

  const ContentComponent = () => {
    switch (type) {
      case 'PROBLEM_CONTENT':
        return <ProblemViewer problem={data?.problemContent} loading={false} />;
      case 'CHILD_PROBLEM_CONTENT':
        return <ProblemViewer problem={data?.problemContent} loading={false} />;
      case 'PROBLEM_POINTING_QUESTION':
      case 'CHILD_PROBLEM_POINTING_QUESTION':
        return (
          <ProblemViewer
            problem={data?.pointings?.find((p) => p.id === pointingId)?.questionContent}
            loading={false}
          />
        );
      case 'PROBLEM_POINTING_COMMENT':
      case 'CHILD_PROBLEM_POINTING_COMMENT':
        return (
          <ProblemViewer
            problem={data?.pointings?.find((p) => p.id === pointingId)?.commentContent}
            loading={false}
          />
        );
      case 'PROBLEM_MAIN_ANALYSIS':
        return (
          <>
            {data?.mainAnalysisImage && (
              <ImageContainer>
                <Image
                  src={data.mainAnalysisImage.url ?? ''}
                  alt='analysis'
                  className='w-full object-contain'
                  width={700}
                  height={200}
                  priority
                />
              </ImageContainer>
            )}
          </>
        );
      case 'PROBLEM_MAIN_HAND_ANALYSIS':
        return (
          <>
            {data?.mainHandAnalysisImage && (
              <ImageContainer>
                <Image
                  src={data.mainHandAnalysisImage.url ?? ''}
                  alt='analysis'
                  className='w-full object-contain'
                  width={700}
                  height={200}
                  priority
                />
              </ImageContainer>
            )}
          </>
        );

      case 'PROBLEM_READING_TIP_CONTENT':
        return <ProblemViewer problem={data?.readingTipContent} loading={false} />;
      case 'PROBLEM_ONE_STEP_MORE':
        return <ProblemViewer problem={data?.oneStepMoreContent} loading={false} />;
      default:
        return <></>;
    }
  };
  return <div>{ContentComponent()}</div>;
};
export default QnaContent;
