import {
  AnswerInput,
  Header,
  ImageUpload,
  LevelSelect,
  PlusButton,
  ProblemEssentialInput,
  TagSelect,
} from '@components';
import { useAnswerInput, useProblemEssentialInput, useSelectTag } from '@hooks';
import { createFileRoute } from '@tanstack/react-router';
import { LevelType } from '@types';
import { ReactNode, useState } from 'react';

export const Route = createFileRoute('/_GNBLayout/problem/$problemId/')({
  component: RouteComponent,
});

const SectionLayout = ({ children }: { children: ReactNode }) => {
  return (
    <section className='border-lightgray500 w-full rounded-[1.6rem] border bg-white p-[3.2rem]'>
      {children}
    </section>
  );
};

function RouteComponent() {
  const { problemId } = Route.useParams();

  const {
    problemType,
    practiceTest,
    practiceTestNumber,
    handleChangeType,
    handlePracticeTest,
    handleChangeNumber,
  } = useProblemEssentialInput();

  // const { selectedList, unselectedList, onClickSelectTag, onClickRemoveTag } = useSelectTag();
  const { problemAnswerType, answer, handleClickProblemAnswerType, handleChangeAnswer } =
    useAnswerInput();
  const [level, setLevel] = useState<LevelType | undefined>();

  return (
    <>
      <Header title={`문항 ID : ${problemId}`} />
      <ProblemEssentialInput
        problemType={problemType}
        practiceTest={practiceTest}
        practiceTestNumber={practiceTestNumber}
        handleChangeType={handleChangeType}
        handlePracticeTest={handlePracticeTest}
        handleChangeNumber={handleChangeNumber}
      />
      <div className='mt-[4.8rem] flex flex-col gap-[4.8rem]'>
        <SectionLayout>
          <div className='flex flex-col gap-[1.6rem]'>
            <h3 className='font-bold-32 text-black'>메인 문제</h3>
            <div className='flex'>
              <h6 className='font-medium-24 text-black'>메인 문항 개념 태그</h6>
              {/* <TagSelect
                sizeType='long'
                selectedList={selectedList}
                unselectedList={unselectedList}
                onClickSelectTag={onClickSelectTag}
                onClickRemoveTag={onClickRemoveTag}
              /> */}
            </div>
            <h6 className='font-medium-24 text-black'>난이도 선택</h6>
            <LevelSelect
              level={level}
              handleClickLevel={(level) => {
                setLevel(level);
              }}
            />
            <h6 className='font-medium-24 text-black'>메인 문항 답 입력</h6>
            <AnswerInput
              problemAnswerType={problemAnswerType}
              answer={answer}
              handleClickProblemAnswerType={handleClickProblemAnswerType}
              handleChangeAnswer={handleChangeAnswer}
            />
            <h6 className='font-medium-24 text-black'>메인 문항 선택</h6>
            <ImageUpload problemId={problemId} imageType='MAIN_PROBLEM' />
            {/* <h6 className='font-medium-24 text-black'>메인 문항 분석 선택</h6>
            <ImageUpload />
            <h6 className='font-medium-24 text-black'>메인 문항 손해설</h6>
            <ImageUpload /> */}
          </div>
        </SectionLayout>
        {/* <SectionLayout>
          <div className='flex items-baseline gap-[1.6rem]'>
            <h3 className='font-bold-32 text-black'>새끼 문제 등록</h3>
            <p className='font-medium-14 text-lightgray500'>
              새끼 문항은 저장 후 항목 추가가 불가능해요
            </p>
          </div>
          <div className='grid grid-cols-2 gap-x-[4.8rem] gap-y-[6.4rem]'>
            <div className='mt-[3.2rem] flex flex-col gap-[3.2rem]'>
              <h6 className='font-medium-24 text-black'>새끼 문항 개념 태그</h6>
              <TagSelect sizeType='long' />
              <h6 className='font-medium-24 text-black'>새끼 문항 선택</h6>
              <ImageUpload />
              <h6 className='font-medium-24 text-black'>새끼 문항 답 입력</h6>
              <AnswerInput />
            </div>
          </div>
        </SectionLayout>
        <SectionLayout>
          <h6 className='font-medium-24 text-black'>TIP</h6>
          <div className='mt-[3.2rem] grid grid-cols-2 gap-[4.8rem]'>
            <div>
              <h6 className='font-medium-24 text-black'>문항을 읽어내려갈 때</h6>
              <ImageUpload />
            </div>
            <div>
              <h6 className='font-medium-24 text-black'>1등급 선배가 해주는 조언</h6>
              <ImageUpload />
            </div>
          </div>
          <h6 className='font-medium-24 mt-[3.2rem] text-black'>진단 및 처방</h6>
          <div className='mt-[2.4rem] grid grid-cols-2 gap-x-[4.8rem] gap-y-[2.4rem]'>
            <ImageUpload />
            <ImageUpload />
            <div className='flex h-full items-center'>
              <PlusButton />
            </div>
          </div>
        </SectionLayout> */}
      </div>
    </>
  );
}
