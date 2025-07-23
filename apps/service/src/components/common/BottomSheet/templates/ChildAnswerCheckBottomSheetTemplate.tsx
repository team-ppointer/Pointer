import { IcCorrect, IcIncorrect } from '@svg';
import { components } from '@schema';

import BaseBottomSheetTemplate from './BaseBottomSheetTemplate';
import postProblemSubmit from '@/apis/controller/submit/postProblemSubmit';

type ChildProblemSubmitUpdateResponse = components['schemas']['SubmitUpdateResponse'];

interface ChildAnswerCheckBottomSheetTemplateProps {
  result: ChildProblemSubmitUpdateResponse | undefined;
  onClose: () => void;
  handleClickShowPointing?: () => void;
  handleClickNext?: () => void;
  handleClickShowAnswer?: () => void;
}

const ChildAnswerCheckBottomSheetTemplate = ({
  result,
  onClose,
  handleClickShowPointing,
  handleClickNext,
  handleClickShowAnswer,
}: ChildAnswerCheckBottomSheetTemplateProps) => {
  if (!result) return null;

  const { status } = result;
  const isCorrect = status === 'CORRECT' || status === 'SEMI_CORRECT';

  return (
    <BaseBottomSheetTemplate>
      <BaseBottomSheetTemplate.Content>
        {isCorrect ? <IcCorrect width={48} height={48} /> : <IcIncorrect width={48} height={48} />}
        <BaseBottomSheetTemplate.Text text={isCorrect ? '정답이에요' : '오답이에요'} />
      </BaseBottomSheetTemplate.Content>
      <BaseBottomSheetTemplate.ButtonSection>
        <BaseBottomSheetTemplate.Button
          variant='recommend'
          label='포인팅 보기'
          onClick={handleClickShowPointing}
        />
        <BaseBottomSheetTemplate.Button label='다음 문제 풀기' onClick={handleClickNext} />
        {!isCorrect && (
          <>
            <BaseBottomSheetTemplate.Button label='다시 풀어보기' onClick={onClose} />
            <BaseBottomSheetTemplate.Button label='정답 확인하기' onClick={handleClickShowAnswer} />
          </>
        )}
      </BaseBottomSheetTemplate.ButtonSection>
    </BaseBottomSheetTemplate>
  );
};

export default ChildAnswerCheckBottomSheetTemplate;
