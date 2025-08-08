import { AnswerInput, ComponentWithLabel, Input, SectionCard, Tag, Button } from '@components';
import { Controller, Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { components } from '@schema';

import { ImageUpload, LevelSelect, TextArea } from '@/components/problem';
import { ProblemAnswerType } from '@/types/component';

type ProblemUpdateRequest = components['schemas']['ProblemUpdateRequest'];
type ProblemInfoResp = components['schemas']['ProblemInfoResp'];

interface MainProblemSectionProps {
  control: Control<ProblemUpdateRequest>;
  register: UseFormRegister<ProblemUpdateRequest>;
  errors: FieldErrors<ProblemUpdateRequest>;
  concepts?: number[] | undefined;
  selectedAnswerType?: ProblemAnswerType;
  selectedAnswer?: number;
  tagsNameMap?: Record<number, string>;
  fetchedProblemData?: ProblemInfoResp;
  onRemoveTag?: (tag: number) => void;
  onOpenTagModal?: () => void;
}

export const MainProblemSection = ({
  control,
  register,
  errors,
  concepts,
  selectedAnswerType,
  selectedAnswer,
  tagsNameMap = {},
  fetchedProblemData,
  onRemoveTag,
  onOpenTagModal,
}: MainProblemSectionProps) => {
  return (
    <SectionCard>
      <h3 className='font-bold-32 mb-12 text-black'>메인 문제 등록</h3>
      <div className='flex flex-col gap-[3.2rem]'>
        <ComponentWithLabel label='메인 문제 타이틀 입력' labelWidth='15.4rem'>
          <Input {...register('title')} />
        </ComponentWithLabel>
        {concepts !== undefined && onRemoveTag && onOpenTagModal && (
          <ComponentWithLabel label='메인 문제 개념 태그' labelWidth='15.4rem'>
            <div className='flex flex-wrap gap-[0.8rem]'>
              {concepts &&
                concepts?.length > 0 &&
                concepts.map((tag) => (
                  <Tag
                    key={tag}
                    label={tagsNameMap[tag] ?? ''}
                    removable
                    color='dark'
                    onClick={() => onRemoveTag(tag)}
                  />
                ))}
              <Tag label='태그 추가하기' onClick={onOpenTagModal} color='lightgray' />
            </div>
          </ComponentWithLabel>
        )}
        {selectedAnswerType !== undefined && selectedAnswer !== undefined && (
          <ComponentWithLabel label='메인 문제 답 입력' labelWidth='15.4rem'>
            <AnswerInput>
              <AnswerInput.AnswerTypeSection
                selectedAnswerType={selectedAnswerType}
                {...register('answerType')}
              />
              <AnswerInput.AnswerInputSection
                selectedAnswerType={selectedAnswerType}
                selectedAnswer={selectedAnswer}
                {...register('answer', { valueAsNumber: true })}
              />
            </AnswerInput>
          </ComponentWithLabel>
        )}
        <div className='flex w-full items-center justify-between'>
          <ComponentWithLabel label='메인 문제 난도 선택' labelWidth='15.4rem'>
            <Controller
              control={control}
              name='difficulty'
              render={({ field }) => (
                <LevelSelect selectedLevel={field.value} onChange={field.onChange} />
              )}
            />
          </ComponentWithLabel>
          <div>
            <ComponentWithLabel label='권장 시간 입력'>
              <div className='flex gap-[2.4rem]'>
                <div className='flex items-center gap-[1.6rem]'>
                  <input
                    className='font-bold-18 border-lightgray500 h-[5.6rem] w-[5.6rem] rounded-[16px] border bg-white px-[1.6rem] py-[0.8rem]'
                    {...register('recommendedTimeSec', {
                      valueAsNumber: true,
                    })}
                  />
                  <span className='font-medium-18 text-black'>초</span>
                </div>
              </div>
            </ComponentWithLabel>
          </div>
        </div>
        <ComponentWithLabel label='메인 문제 입력' labelWidth='15.4rem' direction='column'>
          <Button type='button' variant='light' sizeType='full' onClick={() => {}}>
            입력 바로가기
          </Button>
        </ComponentWithLabel>

        <div className='grid grid-cols-2 gap-[4.8rem]'>
          <div>
            <ComponentWithLabel label='메인 문제 분석 선택' direction='column'>
              <Controller
                control={control}
                name='mainAnalysisImageId'
                render={({ field }) => {
                  return (
                    <ImageUpload
                      imageUrl={fetchedProblemData?.mainAnalysisImage?.url}
                      imageId={fetchedProblemData?.mainAnalysisImage?.id}
                      handleChangeImageUrl={(imageData) => {
                        field.onChange(imageData?.id);
                      }}
                    />
                  );
                }}
              />
            </ComponentWithLabel>
          </div>
          <div>
            <ComponentWithLabel label='메인 문제 손해설 선택' direction='column'>
              <Controller
                control={control}
                name='mainHandAnalysisImageId'
                render={({ field }) => (
                  <ImageUpload
                    imageUrl={fetchedProblemData?.mainHandAnalysisImage?.url}
                    imageId={fetchedProblemData?.mainHandAnalysisImage?.id}
                    handleChangeImageUrl={(imageData) => {
                      field.onChange(imageData?.id);
                    }}
                  />
                )}
              />
            </ComponentWithLabel>
          </div>
          <div>
            <ComponentWithLabel label='포인팅 질문' labelWidth='15.4rem' direction='column'>
              <Button type='button' variant='light' sizeType='full' onClick={() => {}}>
                입력 바로가기
              </Button>
            </ComponentWithLabel>
          </div>
          <div>
            <ComponentWithLabel label='포인팅 처방' labelWidth='15.4rem' direction='column'>
              <Button type='button' variant='light' sizeType='full' onClick={() => {}}>
                입력 바로가기
              </Button>
            </ComponentWithLabel>
          </div>
        </div>

        <ComponentWithLabel label='메모 작성' direction='column'>
          <TextArea placeholder={'여기에 메모를 작성해주세요.'} {...register('memo')} />
        </ComponentWithLabel>
      </div>
    </SectionCard>
  );
};
