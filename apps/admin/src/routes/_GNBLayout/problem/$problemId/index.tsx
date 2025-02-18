import {
  AnswerInput,
  Button,
  ComponentWithLabel,
  Header,
  ImageUpload,
  Input,
  LevelSelect,
  PlusButton,
  ProblemEssentialInput,
  SectionCard,
  TagSelect,
  TextArea,
} from '@components';
import { useAnswerInput, useProblemEssentialInput, useSelectTag } from '@hooks';
import { components } from '@schema';
import { createFileRoute } from '@tanstack/react-router';
import { LevelType } from '@types';
import { useState } from 'react';
import { produce } from 'immer';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

export const Route = createFileRoute('/_GNBLayout/problem/$problemId/')({
  component: RouteComponent,
});

type ProblemUpdateRequest = components['schemas']['ProblemUpdateRequest'];

const initialData = {
  problemType: 'GICHUL_PROBLEM',
  practiceTestId: 2,
  number: 30,
  title: 'title',
  conceptTagIds: [2, 3, 4, 5],
  answerType: 'MULTIPLE_CHOICE',
  answer: 'answer',
  difficulty: 1,
  memo: 'memo',
  mainProblemImageUrl: 'string',
  mainAnalysisImageUrl: 'string',
  mainHandwritingExplanationImageUrl: 'string',

  childProblems: [
    {
      conceptTagIds: [0],
      imageUrl: 'string',
      answerType: 'MULTIPLE_CHOICE',
      answer: 'string',
    },
  ],

  readingTipImageUrl: 'string',
  seniorTipImageUrl: 'string',
  prescriptionImageUrls: ['string'],
} as ProblemUpdateRequest;

function RouteComponent() {
  const { problemId } = Route.useParams();

  const { register, handleSubmit, reset, control, watch, setValue } = useForm({
    defaultValues: initialData,
  });

  const selectedAnswerType = watch('answerType');
  const selectedAnswer = watch('answer');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'childProblems',
  });

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
      {/* <Button
        onClick={() => {
          append({
            conceptTagIds: [1, 2, 3],
            imageUrl: 'image',
            answerType: 'MULTIPLE_CHOICE',
            answer: 'answer',
          });
        }}>
        더하기
      </Button> */}
      <form
        onSubmit={handleSubmit((data) => {
          console.log(data);
        })}>
        <Button type='submit'>저장</Button>
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
          <SectionCard>
            <div className='flex flex-col gap-[1.6rem]'>
              <ComponentWithLabel label='메인 문항 타이틀 입력' labelWidth='15.4rem'>
                <Input {...register('title')} />
              </ComponentWithLabel>
              {/* <ComponentWithLabel label='메인 문항 개념 태그' labelWidth='15.4rem'>
              <TagSelect
                sizeType='long'
                selectedList={selectedList}
                unselectedList={unselectedList}
                onClickSelectTag={onClickSelectTag}
                onClickRemoveTag={onClickRemoveTag}
              />
            </ComponentWithLabel> */}
              <ComponentWithLabel label='난이도 선택' labelWidth='15.4rem'>
                <Controller
                  control={control}
                  name='difficulty'
                  render={({ field }) => (
                    <LevelSelect selectedLevel={field.value} onChange={field.onChange} />
                  )}
                />
              </ComponentWithLabel>
              <ComponentWithLabel label='메인 문항 답 입력' labelWidth='15.4rem'>
                {/* <AnswerInput
                  selectedAnswerType={selectedAnswerType}
                  problemAnswerType={problemAnswerType}
                  answer={answer}
                  handleClickProblemAnswerType={handleClickProblemAnswerType}
                  handleChangeAnswer={handleChangeAnswer}
                /> */}
                <AnswerInput>
                  <AnswerInput.AnswerTypeSection
                    selectedAnswerType={selectedAnswerType}
                    {...register('answerType')}
                  />
                  <AnswerInput.AnswerInputSection
                    selectedAnswerType={selectedAnswerType}
                    selectedAnswer={selectedAnswer}
                    {...register('answer')}
                  />
                </AnswerInput>
              </ComponentWithLabel>
              <ComponentWithLabel label='문항 메모' labelWidth='15.4rem'>
                <TextArea placeholder={'여기에 메모를 작성해주세요.'} {...register('memo')} />
              </ComponentWithLabel>
              <ComponentWithLabel label='메인 문항 선택' labelWidth='15.4rem'>
                <ImageUpload problemId={problemId} imageType='MAIN_PROBLEM' />
              </ComponentWithLabel>
              <ComponentWithLabel label='메인 문항 분석 선택' labelWidth='15.4rem'>
                <ImageUpload problemId={problemId} imageType='MAIN_ANALYSIS' />
              </ComponentWithLabel>
              <ComponentWithLabel label='메인 문항 손해설' labelWidth='15.4rem'>
                <ImageUpload problemId={problemId} imageType='MAIN_HANDWRITING_EXPLANATION' />
              </ComponentWithLabel>
            </div>
          </SectionCard>
          <SectionCard>
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
          </SectionCard>
          <SectionCard>
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
          </SectionCard>
        </div>
      </form>
    </>
  );
}
