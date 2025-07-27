import { Button, Divider } from '@components';
import PointingImageContainer from '@/components/report/PointingImageContainer';
import QuestionSection from './QuestionSection';
import { components } from '@schema';

type PointingWithFeedbackResp = components['schemas']['PointingWithFeedbackResp'];

interface PointingCardProps {
  pointingContent: PointingWithFeedbackResp;
  step: number;
  pointingId: number;
  onPointingAnswer: () => void;
  onPrescriptionAnswer: (isUnderstood: boolean) => void;
}

const PointingCard = ({
  pointingContent,
  step,
  pointingId,
  onPointingAnswer,
  onPrescriptionAnswer,
}: PointingCardProps) => {
  return (
    <div className='border-sub1 flex flex-col gap-[2rem] rounded-[1.6rem] border bg-white p-[2rem]'>
      {/* 포인팅 부분 */}
      <PointingImageContainer
        pointingId={pointingId}
        variant='pointing'
        contents={pointingContent.questionContent}
      />

      {step === 1 && (
        <QuestionSection
          questionText='문제를 풀 때'
          highlightText='해당 포인팅을'
          onAnswer={() => onPointingAnswer()}
        />
      )}

      {/* 처방 부분 (2단계 이상일 때만:포인팅 + 처방 보여주는 상태) */}
      {step >= 2 && (
        <>
          <Divider />
          <PointingImageContainer
            pointingId={pointingId}
            variant='prescription'
            contents={pointingContent.commentContent}
          />

          {step === 2 ? (
            <QuestionSection
              questionText='문제를 풀 때'
              highlightText='처방과 동일하게'
              onAnswer={onPrescriptionAnswer}
            />
          ) : (
            <div>
              <Button className='h-[5rem]' disabled={true}>
                답변을 완료했어요
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PointingCard;
