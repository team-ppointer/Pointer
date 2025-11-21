import Image from 'next/image';

import { ImageContainer, ProblemViewer } from '@components';
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
        return <ProblemViewer content={JSON.parse(data?.problemContent ?? '')} />;
      case 'CHILD_PROBLEM_CONTENT':
        return <ProblemViewer content={JSON.parse(data?.problemContent ?? '')} />;
      case 'PROBLEM_POINTING_QUESTION':
      case 'CHILD_PROBLEM_POINTING_QUESTION':
        return (
          <ProblemViewer
            content={JSON.parse(
              data?.pointings?.find((p: { id: number }) => p.id === pointingId)?.questionContent ??
                ''
            )}
          />
        );
      case 'PROBLEM_POINTING_COMMENT':
      case 'CHILD_PROBLEM_POINTING_COMMENT':
        return (
          <ProblemViewer
            content={JSON.parse(
              data?.pointings?.find((p: { id: number }) => p.id === pointingId)?.commentContent ??
                ''
            )}
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
        return <ProblemViewer content={JSON.parse(data?.readingTipContent ?? '')} />;
      case 'PROBLEM_ONE_STEP_MORE':
        return <ProblemViewer content={JSON.parse(data?.oneStepMoreContent ?? '')} />;
      default:
        return <></>;
    }
  };
  return <div>{ContentComponent()}</div>;
};
export default QnaContent;
