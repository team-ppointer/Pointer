import { IcCorrect, IcIncorrect } from '@svg';
import { ProblemStatus } from '@types';

import BaseBottomSheetTemplate from './BaseBottomSheetTemplate';

interface MainAnswerCheckModalTemplateProps {
  result: ProblemStatus | undefined;
  onClose: () => void;
  hasChildProblem: boolean;
  handleClickStepSolve?: () => void;
  handleClickShowReport?: () => void;
  handleClickPointing?: () => void;
}

const MainAnswerCheckModalTemplate = ({
  result,
  onClose,
  hasChildProblem,
  handleClickStepSolve,
  handleClickShowReport,
  handleClickPointing,
}: MainAnswerCheckModalTemplateProps) => {
  if (!result) return null;
  const isCorrect = result === 'CORRECT' || result === 'SEMI_CORRECT';

  return (
    <BaseBottomSheetTemplate>
      <BaseBottomSheetTemplate.Content>
        {isCorrect ? <IcCorrect width={48} height={48} /> : <IcIncorrect width={48} height={48} />}
        <BaseBottomSheetTemplate.Text text={isCorrect ? '정답이에요' : '오답이에요'} />
      </BaseBottomSheetTemplate.Content>
      <BaseBottomSheetTemplate.ButtonSection>
        {hasChildProblem && (
          <BaseBottomSheetTemplate.Button
            variant='recommend'
            label='단계별로 풀어보기'
            onClick={handleClickStepSolve}
          />
        )}
        {isCorrect && (
          <BaseBottomSheetTemplate.Button
            label='포인팅 보기'
            variant='recommend'
            onClick={handleClickPointing}
          />
        )}
        <BaseBottomSheetTemplate.Button label='해설 보기' onClick={handleClickShowReport} />
        {!isCorrect && <BaseBottomSheetTemplate.Button label='다시 풀어보기' onClick={onClose} />}
      </BaseBottomSheetTemplate.ButtonSection>
    </BaseBottomSheetTemplate>
  );
};

export default MainAnswerCheckModalTemplate;
