import { Button, ComponentWithLabel, Input, PracticeTestSelect } from '@components';
import { ExamType, ProblemTypeType } from '@types';

interface Props {
  problemType: ProblemTypeType;
  practiceTest: ExamType | null;
  practiceTestNumber: number | undefined;
  handleChangeType: (type: ProblemTypeType) => void;
  handlePracticeTest: (exam: ExamType | null) => void;
  handleChangeNumber: (num: number) => void;
}

const ProblemTypeName = {
  GICHUL_PROBLEM: '기출 문제',
  VARIANT_PROBLEM: '변형 문제',
  CREATION_PROBLEM: '창작 문제',
};

const ProblemTypeList: ProblemTypeType[] = Object.keys(ProblemTypeName) as ProblemTypeType[];

const ProblemEssentialInput = ({
  problemType,
  practiceTest,
  practiceTestNumber,
  handleChangeType,
  handlePracticeTest,
  handleChangeNumber,
}: Props) => {
  return (
    <section className='border-lightgray500 mt-[4.8rem] w-full rounded-[1.6rem] border bg-white p-[3.2rem]'>
      <div className='flex items-center justify-between'>
        <h3 className='font-bold-32'>필수 입력 항목</h3>
        <div className='flex items-center gap-[0.8rem]'>
          {ProblemTypeList.map((type) => (
            <Button
              key={type}
              type='button'
              variant={problemType === type ? 'light' : 'dimmed'}
              onClick={() => handleChangeType(type)}>
              {ProblemTypeName[type]}
            </Button>
          ))}
        </div>
      </div>
      {problemType !== 'CREATION_PROBLEM' && (
        <div className='mt-[3.2rem]'>
          <div className='flex h-fit w-full items-center gap-[4.8rem]'>
            <ComponentWithLabel label='메인 문항 모의고사 '>
              <PracticeTestSelect
                practiceTest={practiceTest}
                handlePracticeTest={handlePracticeTest}
              />
            </ComponentWithLabel>
            <ComponentWithLabel label='메인 문항 번호 입력'>
              <Input
                type='number'
                placeholder={'입력해주세요'}
                value={practiceTestNumber ? practiceTestNumber.toString() : ''}
                onChange={(e) => {
                  handleChangeNumber(Number(e.target.value));
                }}
              />
            </ComponentWithLabel>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProblemEssentialInput;
