import { IcCorrect, IcIncorrect } from '@svg';
import { components } from '@schema';

import { SmallButton } from '../../Buttons';

import BaseModalTemplate from './BaseModalTemplate';

type ChildProblemSubmitUpdateResponse = components['schemas']['ChildProblemSubmitUpdateResponse'];
interface ChildAnswerCheckModalTemplateProps {
  handleClickButton?: () => void;
  onClose: () => void;
  result: ChildProblemSubmitUpdateResponse | undefined;
  handleClickShowAnswer?: () => void;
}

const ChildAnswerCheckModalTemplate = ({
  handleClickButton,
  result,
  onClose,
  handleClickShowAnswer,
}: ChildAnswerCheckModalTemplateProps) => {
  if (!result) return null;

  const { status } = result;
  const isCorrect = status === 'CORRECT' || status === 'RETRY_CORRECT';

  return (
    <BaseModalTemplate>
      <BaseModalTemplate.Content>
        {isCorrect ? <IcCorrect width={48} height={48} /> : <IcIncorrect width={48} height={48} />}
      </BaseModalTemplate.Content>
      <BaseModalTemplate.Text text={isCorrect ? '정답이에요' : '오답이에요'} />
      <BaseModalTemplate.ButtonSection>
        <BaseModalTemplate.Button onClick={onClose}>다시 풀어보기</BaseModalTemplate.Button>
        <BaseModalTemplate.Button onClick={handleClickButton} variant='light'>
          다음 문제로 넘어가기
        </BaseModalTemplate.Button>
        {status === 'INCORRECT' && (
          <SmallButton variant='underline' sizeType='small' onClick={handleClickShowAnswer}>
            정답 확인하기
          </SmallButton>
        )}
      </BaseModalTemplate.ButtonSection>
    </BaseModalTemplate>
  );
};

export default ChildAnswerCheckModalTemplate;
