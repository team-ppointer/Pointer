import { useState } from 'react';
import { AnswerInput, ComponentWithLabel, Input, SectionCard, Tag, Button } from '@components';
import {
  Controller,
  Control,
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  useWatch,
} from 'react-hook-form';
import { components } from '@schema';
import EditorModal from '@repo/pointer-editor/EditorModal';

import { ImageUpload, LevelSelect, TextArea } from '@/components/problem';
import { ProblemAnswerType } from '@/types/component';

type ProblemUpdateRequest = components['schemas']['ProblemUpdateRequest'];
type ProblemInfoResp = components['schemas']['ProblemInfoResp'];
type ContentBlockUpdateRequest = components['schemas']['ContentBlockUpdateRequest'];

interface MainProblemSectionProps {
  control: Control<ProblemUpdateRequest>;
  register: UseFormRegister<ProblemUpdateRequest>;
  errors: FieldErrors<ProblemUpdateRequest>;
  setValue: UseFormSetValue<ProblemUpdateRequest>;
  concepts?: number[] | undefined;
  selectedAnswerType?: ProblemAnswerType;
  tagsNameMap?: Record<number, string>;
  fetchedProblemData?: ProblemInfoResp;
  onRemoveTag?: (tag: number) => void;
  onOpenTagModal?: () => void;
}

export const MainProblemSection = ({
  control,
  register,
  errors,
  setValue,
  concepts,
  selectedAnswerType,
  tagsNameMap = {},
  fetchedProblemData,
  onRemoveTag,
  onOpenTagModal,
}: MainProblemSectionProps) => {
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isPointingQuestionModalOpen, setIsPointingQuestionModalOpen] = useState(false);
  const [isPointingCommentModalOpen, setIsPointingCommentModalOpen] = useState(false);

  // 임시로 수정된 블록들을 저장하는 상태
  const [tempMainProblemBlocks, setTempMainProblemBlocks] = useState<unknown[] | null>(
    fetchedProblemData?.problemContent?.blocks || null
  );
  const [tempPointingQuestionBlocks, setTempPointingQuestionBlocks] = useState<unknown[] | null>(
    fetchedProblemData?.pointings?.[0]?.questionContent?.blocks || null
  );
  const [tempPointingCommentBlocks, setTempPointingCommentBlocks] = useState<unknown[] | null>(
    fetchedProblemData?.pointings?.[0]?.commentContent?.blocks || null
  );

  const handleOpenEditorModal = () => {
    setIsEditorModalOpen(true);
  };

  const handleCloseEditorModal = () => {
    setIsEditorModalOpen(false);
  };

  const handleOpenPointingQuestionModal = () => {
    setIsPointingQuestionModalOpen(true);
  };

  const handleClosePointingQuestionModal = () => {
    setIsPointingQuestionModalOpen(false);
  };

  const handleOpenPointingCommentModal = () => {
    setIsPointingCommentModalOpen(true);
  };

  const handleClosePointingCommentModal = () => {
    setIsPointingCommentModalOpen(false);
  };

  // answerType 변경 시 사용자 상호작용에서만 answer 초기화하도록 onChange에 훅을 건다
  const answerTypeRegister = register('answerType', {
    required: '필수 입력 항목입니다.',
  });

  const watchedAnswer = useWatch({ control, name: 'answer' });

  const formatBlocks = (blocks: unknown[]): ContentBlockUpdateRequest[] => {
    return blocks.map((block, index) => {
      const blockData = block as {
        id?: number;
        type?: 'TEXT' | 'IMAGE';
        data?: string;
        content?: string;
      };

      return {
        id: blockData.id ?? 0,
        rank: index,
        type: blockData.type,
        data: blockData.data || blockData.content,
      };
    });
  };

  const handleSaveEditor = (blocks: unknown[]) => {
    const formattedBlocks = formatBlocks(blocks);
    setValue('problemContent.blocks', formattedBlocks);
    setTempMainProblemBlocks(blocks); // 임시 상태에 원본 블록 저장
    console.log('Updated problemContent blocks:', formattedBlocks);
    setIsEditorModalOpen(false);
  };

  const handleSavePointingQuestion = (blocks: unknown[]) => {
    const formattedBlocks = formatBlocks(blocks);
    setValue('pointings.0.questionContent.blocks', formattedBlocks);
    setTempPointingQuestionBlocks(blocks); // 임시 상태에 원본 블록 저장
    console.log('Updated pointing question blocks:', formattedBlocks);
    setIsPointingQuestionModalOpen(false);
  };

  const handleSavePointingComment = (blocks: unknown[]) => {
    const formattedBlocks = formatBlocks(blocks);
    setValue('pointings.0.commentContent.blocks', formattedBlocks);
    setTempPointingCommentBlocks(blocks); // 임시 상태에 원본 블록 저장
    console.log('Updated pointing comment blocks:', formattedBlocks);
    setIsPointingCommentModalOpen(false);
  };
  return (
    <SectionCard>
      <h3 className='font-bold-32 mb-12 text-black'>메인 문제 등록</h3>
      <div className='flex flex-col gap-800'>
        <ComponentWithLabel label='메인 문제 타이틀 입력' labelWidth='15.4rem'>
          <Input
            {...register('title', { required: '필수 입력 항목입니다.' })}
            className={`${errors?.title ? 'border-red focus:border-red' : ''}`}
          />
          {errors?.title && (
            <p className='font-medium-14 text-red mt-200'>
              {(errors.title as { message?: string })?.message || '필수 입력 항목입니다.'}
            </p>
          )}
        </ComponentWithLabel>
        <ComponentWithLabel label='메인 문제 개념 태그' labelWidth='15.4rem'>
          <div className='flex flex-wrap gap-200'>
            {concepts &&
              concepts?.length > 0 &&
              concepts.map((tag) => (
                <Tag
                  key={tag}
                  label={tagsNameMap[tag] ?? ''}
                  removable
                  color='dark'
                  onClick={() => onRemoveTag?.(tag)}
                />
              ))}
            <Tag label='태그 추가하기' onClick={onOpenTagModal} color='lightgray' />
          </div>
        </ComponentWithLabel>

        <ComponentWithLabel label='메인 문제 답 입력' labelWidth='15.4rem'>
          <div className='rounded-400 w-full'>
            <AnswerInput>
              <AnswerInput.AnswerTypeSection
                selectedAnswerType={selectedAnswerType}
                {...answerTypeRegister}
                onChange={(e) => {
                  answerTypeRegister.onChange(e);
                  setValue('answer', undefined as unknown as number, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
              <AnswerInput.AnswerInputSection
                selectedAnswerType={selectedAnswerType}
                selectedAnswer={watchedAnswer}
                isError={Boolean(errors?.answer)}
                {...register('answer', {
                  valueAsNumber: true,
                  required: '필수 입력 항목입니다.',
                })}
              />
            </AnswerInput>
          </div>
          {(errors?.answerType || errors?.answer) && (
            <p className='font-medium-14 text-red mt-200'>필수 입력 항목입니다.</p>
          )}
        </ComponentWithLabel>

        <div className='flex w-full items-center justify-between'>
          <ComponentWithLabel label='메인 문제 난도 선택' labelWidth='15.4rem'>
            <div className={`${errors?.difficulty ? 'border-red rounded-400 border p-400' : ''}`}>
              <Controller
                control={control}
                name='difficulty'
                rules={{ required: '필수 입력 항목입니다.' }}
                render={({ field }) => (
                  <LevelSelect selectedLevel={field.value} onChange={field.onChange} />
                )}
              />
            </div>
            {errors?.difficulty && (
              <p className='font-medium-14 text-red mt-200'>
                {(errors.difficulty as { message?: string })?.message || '필수 입력 항목입니다.'}
              </p>
            )}
          </ComponentWithLabel>
          <div>
            <ComponentWithLabel label='권장 시간 입력'>
              <div className='flex gap-600'>
                <div className='flex items-center gap-400'>
                  <input
                    className={`font-bold-18 rounded-400 h-[5.6rem] w-[5.6rem] border bg-white px-400 py-200 ${
                      errors?.recommendedTimeSec
                        ? 'border-red focus:border-red'
                        : 'border-lightgray500'
                    }`}
                    {...register('recommendedTimeSec', {
                      valueAsNumber: true,
                      required: '필수 입력 항목입니다.',
                    })}
                  />
                  <span className='font-medium-18 text-black'>초</span>
                </div>
              </div>
              {errors?.recommendedTimeSec && (
                <p className='font-medium-14 text-red mt-200'>
                  {(errors.recommendedTimeSec as { message?: string })?.message ||
                    '필수 입력 항목입니다.'}
                </p>
              )}
            </ComponentWithLabel>
          </div>
        </div>
        <ComponentWithLabel label='메인 문제 입력' labelWidth='15.4rem' direction='column'>
          <Button
            type='button'
            variant={tempMainProblemBlocks && tempMainProblemBlocks?.length > 0 ? 'dark' : 'light'}
            sizeType='full'
            onClick={handleOpenEditorModal}>
            {tempMainProblemBlocks && tempMainProblemBlocks?.length > 0
              ? '입력 확인 및 수정하기'
              : '입력 바로가기'}
          </Button>
        </ComponentWithLabel>

        <div className='grid grid-cols-2 gap-1200'>
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
              <Button
                type='button'
                variant={
                  tempPointingQuestionBlocks && tempPointingQuestionBlocks?.length > 0
                    ? 'dark'
                    : 'light'
                }
                sizeType='full'
                onClick={handleOpenPointingQuestionModal}>
                {tempPointingQuestionBlocks && tempPointingQuestionBlocks?.length > 0
                  ? '입력 확인 및 수정하기'
                  : '입력 바로가기'}
              </Button>
            </ComponentWithLabel>
          </div>
          <div>
            <ComponentWithLabel label='포인팅 처방' labelWidth='15.4rem' direction='column'>
              <Button
                type='button'
                variant={
                  tempPointingCommentBlocks && tempPointingCommentBlocks?.length > 0
                    ? 'dark'
                    : 'light'
                }
                sizeType='full'
                onClick={handleOpenPointingCommentModal}>
                {tempPointingCommentBlocks && tempPointingCommentBlocks?.length > 0
                  ? '입력 확인 및 수정하기'
                  : '입력 바로가기'}
              </Button>
            </ComponentWithLabel>
          </div>
        </div>

        <ComponentWithLabel label='메모 작성' direction='column'>
          <TextArea placeholder={'여기에 메모를 작성해주세요.'} {...register('memo')} />
        </ComponentWithLabel>
      </div>

      {/* EditorModal - 메인 문제 */}
      {isEditorModalOpen && (
        <EditorModal
          blocks={tempMainProblemBlocks || fetchedProblemData?.problemContent?.blocks || []}
          onSave={handleSaveEditor}
          onClose={handleCloseEditorModal}
        />
      )}

      {/* EditorModal - 포인팅 질문 */}
      {isPointingQuestionModalOpen && (
        <EditorModal
          blocks={
            tempPointingQuestionBlocks ||
            fetchedProblemData?.pointings?.[0]?.questionContent?.blocks ||
            []
          }
          onSave={handleSavePointingQuestion}
          onClose={handleClosePointingQuestionModal}
        />
      )}

      {/* EditorModal - 포인팅 처방 */}
      {isPointingCommentModalOpen && (
        <EditorModal
          blocks={
            tempPointingCommentBlocks ||
            fetchedProblemData?.pointings?.[0]?.commentContent?.blocks ||
            []
          }
          onSave={handleSavePointingComment}
          onClose={handleClosePointingCommentModal}
        />
      )}
    </SectionCard>
  );
};
