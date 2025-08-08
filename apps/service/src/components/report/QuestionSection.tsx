import { Button } from '@components';
import { IcBulb } from '@svg';

interface QuestionSectionProps {
  questionText: string;
  highlightText: string;
  onAnswer: (isUnderstood: boolean) => void;
  disabled?: boolean;
}

const QuestionSection = ({
  questionText,
  highlightText,
  onAnswer,
  disabled = false,
}: QuestionSectionProps) => {
  return (
    <div>
      <div className='flex gap-[0.8rem]'>
        <IcBulb width={20} height={20} />
        <div className='flex flex-col gap-[0.4rem]'>
          <h3 className='font-medium-16 flex flex-wrap text-[#1E1E21]'>
            {questionText} &nbsp;<p className='text-main'>{highlightText}&nbsp;</p>
            떠올렸나요?
          </h3>
          <p className='font-medium-12 text-lightgray500'>
            답변 결과는 추후 개인 맞춤 문제 추천때 반영돼요
          </p>
        </div>
      </div>
      <div className='mt-[1.6rem] grid grid-cols-2 gap-[0.8rem]'>
        <Button
          variant='light'
          className='h-[5rem]'
          onClick={() => onAnswer(true)}
          disabled={disabled}>
          떠올렸어요
        </Button>
        <Button className='h-[5rem]' onClick={() => onAnswer(false)} disabled={disabled}>
          못 떠올렸어요
        </Button>
      </div>
    </div>
  );
};

export default QuestionSection;
