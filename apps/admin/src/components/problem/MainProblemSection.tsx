import { useState, ChangeEvent } from 'react';
import {
  AnswerInput,
  ComponentWithLabel,
  Input,
  SectionCard,
  Tag,
  Button,
  Modal,
  TagSelectModal,
} from '@components';
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
import { IcDelete, IcPlus } from '@svg';
import { useModal } from '@hooks';
import { postOcr } from '@apis';

import { LevelSelect, TextArea } from '@/components/problem';
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
  const ocrMutation = postOcr();
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isPointingQuestionModalOpen, setIsPointingQuestionModalOpen] = useState(false);
  const [isPointingCommentModalOpen, setIsPointingCommentModalOpen] = useState(false);
  const [currentPointingIndex, setCurrentPointingIndex] = useState<number | null>(null);

  // 임시로 수정된 블록들을 저장하는 상태
  const [tempMainProblemBlocks, setTempMainProblemBlocks] = useState<unknown[] | null>(
    fetchedProblemData?.problemContent?.blocks || null
  );
  const [tempPointingQuestionBlocks, setTempPointingQuestionBlocks] = useState<
    Record<number, unknown[] | null>
  >({});
  const [tempPointingCommentBlocks, setTempPointingCommentBlocks] = useState<
    Record<number, unknown[] | null>
  >({});

  // Tag modal for main pointings
  const {
    isOpen: isMainPointingTagModalOpen,
    openModal: openMainPointingTagModal,
    closeModal: closeMainPointingTagModal,
  } = useModal();
  const [currentMainPointingTagList, setCurrentMainPointingTagList] = useState<number[]>([]);

  const handleOpenEditorModal = () => {
    setIsEditorModalOpen(true);
  };

  const handleCloseEditorModal = () => {
    setIsEditorModalOpen(false);
  };

  const handleOpenPointingQuestionModal = (index: number) => {
    setCurrentPointingIndex(index);
    setIsPointingQuestionModalOpen(true);
  };

  const handleClosePointingQuestionModal = () => {
    setIsPointingQuestionModalOpen(false);
  };

  const handleOpenPointingCommentModal = (index: number) => {
    setCurrentPointingIndex(index);
    setIsPointingCommentModalOpen(true);
  };

  const handleClosePointingCommentModal = () => {
    setIsPointingCommentModalOpen(false);
  };

  // answerType 변경 시 사용자 상호작용에서만 answer 초기화하도록 onChange에 훅을 건다
  const answerTypeRegister = register('answerType', {
    required: '필수 입력 항목입니다.',
  });

  const watchedAnswer = useWatch({
    control,
    name: 'answer',
    defaultValue: fetchedProblemData?.answer ?? 1,
  });
  const watchedRecommendedTimeSec = useWatch({
    control,
    name: 'recommendedTimeSec',
    defaultValue: fetchedProblemData?.recommendedTimeSec ?? 0,
  });

  const minutes = Math.floor((watchedRecommendedTimeSec || 0) / 60);
  const seconds = Math.max(0, (watchedRecommendedTimeSec || 0) % 60);

  type MainPointing = components['schemas']['PointingUpdateRequest'];
  const watchedPointings = useWatch<ProblemUpdateRequest>({
    control,
    name: 'pointings',
  }) as MainPointing[] | undefined;

  const pointingList = (
    Array.isArray(watchedPointings)
      ? watchedPointings
      : (fetchedProblemData?.pointings as unknown as MainPointing[] | undefined) || []
  ) as MainPointing[];

  const handleChangeMinutes = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    const nextMinutes = raw === '' ? 0 : Math.max(0, Number(raw));
    const nextTotal = nextMinutes * 60 + seconds;
    setValue('recommendedTimeSec', nextTotal, { shouldDirty: true, shouldValidate: true });
  };

  const handleChangeSeconds = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    let nextSeconds = raw === '' ? 0 : Math.max(0, Number(raw));
    if (!Number.isFinite(nextSeconds)) nextSeconds = 0;
    if (nextSeconds > 59) nextSeconds = 59;
    const nextTotal = minutes * 60 + nextSeconds;
    setValue('recommendedTimeSec', nextTotal, { shouldDirty: true, shouldValidate: true });
  };

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
    if (currentPointingIndex === null) return;
    const formattedBlocks = formatBlocks(blocks);
    setValue(`pointings.${currentPointingIndex}.questionContent.blocks`, formattedBlocks);
    setTempPointingQuestionBlocks((prev) => ({ ...prev, [currentPointingIndex!]: blocks }));
    console.log('Updated pointing question blocks:', formattedBlocks);
    setIsPointingQuestionModalOpen(false);
  };

  const handleSavePointingComment = (blocks: unknown[]) => {
    if (currentPointingIndex === null) return;
    const formattedBlocks = formatBlocks(blocks);
    setValue(`pointings.${currentPointingIndex}.commentContent.blocks`, formattedBlocks);
    setTempPointingCommentBlocks((prev) => ({ ...prev, [currentPointingIndex!]: blocks }));
    console.log('Updated pointing comment blocks:', formattedBlocks);
    setIsPointingCommentModalOpen(false);
  };

  const handleAddPointing = () => {
    const current = (pointingList || []).filter(Boolean) as MainPointing[];
    const newPointing = {
      // id: undefined,
      no: current.length + 1,
      questionContent: { blocks: [] },
      commentContent: { blocks: [] },
      concepts: [],
    };
    setValue('pointings', [...current, newPointing], { shouldDirty: true, shouldValidate: true });
  };

  const handleDeletePointing = (index: number) => {
    const current = (pointingList || []).filter(Boolean) as MainPointing[];
    const updated = current.filter((_, i) => i !== index).map((p, i) => ({ ...p, no: i + 1 }));
    setValue('pointings', updated, { shouldDirty: true, shouldValidate: true });
  };

  const hasPointingBlocks = (type: 'question' | 'comment', index: number): boolean => {
    if (type === 'question') {
      const temp = tempPointingQuestionBlocks[index];
      const fetched = fetchedProblemData?.pointings?.[index]?.questionContent?.blocks;
      return Boolean((temp && temp.length > 0) || (fetched && fetched.length > 0));
    }
    const temp = tempPointingCommentBlocks[index];
    const fetched = fetchedProblemData?.pointings?.[index]?.commentContent?.blocks;
    return Boolean((temp && temp.length > 0) || (fetched && fetched.length > 0));
  };

  const handleOpenMainPointingTagModal = (index: number, concepts: number[]) => {
    setCurrentPointingIndex(index);
    setCurrentMainPointingTagList(concepts || []);
    openMainPointingTagModal();
  };

  const handleChangeMainPointingTagList = (tagList: number[]) => {
    if (currentPointingIndex === null) return;
    setValue(`pointings.${currentPointingIndex}.concepts`, [...tagList], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
  return (
    <div>
      <h3 className='font-bold-32 mb-600 text-black'>메인 문제 입력</h3>
      <SectionCard>
        <div className='flex flex-col gap-800'>
          <ComponentWithLabel label='타이틀' labelWidth='10rem'>
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
          <ComponentWithLabel label='개념 태그' labelWidth='10rem'>
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
              {concepts && concepts?.length === 0 && (
                <p className='font-medium-14 text-red mt-200'>태그를 추가해주세요.</p>
              )}
            </div>
          </ComponentWithLabel>

          <ComponentWithLabel label='답안' labelWidth='10rem'>
            <div className='rounded-400 w-full'>
              <AnswerInput>
                <AnswerInput.AnswerTypeSection
                  selectedAnswerType={selectedAnswerType}
                  registration={answerTypeRegister}
                />
                <AnswerInput.AnswerInputSection
                  selectedAnswerType={selectedAnswerType}
                  selectedAnswer={watchedAnswer}
                  isError={Boolean(errors?.answer)}
                  registration={register('answer', {
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

          <ComponentWithLabel label='난이도' labelWidth='10rem'>
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
          <ComponentWithLabel label='권장 시간' labelWidth='10rem'>
            <div className='flex gap-600'>
              <div className='flex items-center gap-400'>
                <input
                  className={`font-bold-18 rounded-400 h-[5.6rem] w-[5.6rem] border bg-white px-400 py-200 ${
                    errors?.recommendedTimeSec
                      ? 'border-red focus:border-red'
                      : 'border-lightgray500'
                  } [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0`}
                  type='number'
                  min={0}
                  value={Number.isFinite(minutes) ? minutes : 0}
                  onChange={handleChangeMinutes}
                />
                <span className='font-medium-18 text-black'>분</span>
                <input
                  className={`font-bold-18 rounded-400 h-[5.6rem] w-[5.6rem] border bg-white px-400 py-200 ${
                    errors?.recommendedTimeSec
                      ? 'border-red focus:border-red'
                      : 'border-lightgray500'
                  } [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0`}
                  type='number'
                  min={0}
                  max={59}
                  value={Number.isFinite(seconds) ? seconds : 0}
                  onChange={handleChangeSeconds}
                />
                <span className='font-medium-18 text-black'>초</span>
                <input
                  type='hidden'
                  {...register('recommendedTimeSec', {
                    valueAsNumber: true,
                    validate: (v) =>
                      (v !== undefined && v !== null && !Number.isNaN(v)) ||
                      '필수 입력 항목입니다.',
                  })}
                />
              </div>
            </div>
            {errors?.recommendedTimeSec && (
              <p className='font-medium-14 text-red mt-200'>
                {(errors.recommendedTimeSec as { message?: string })?.message ||
                  '필수 입력 항목입니다.'}
              </p>
            )}
          </ComponentWithLabel>

          <ComponentWithLabel label='문제 내용' labelWidth='10rem'>
            <Button
              type='button'
              variant={
                tempMainProblemBlocks && tempMainProblemBlocks?.length > 0 ? 'dark' : 'light'
              }
              sizeType='full'
              onClick={handleOpenEditorModal}>
              {tempMainProblemBlocks && tempMainProblemBlocks?.length > 0
                ? '입력 확인 및 수정하기'
                : '입력 바로가기'}
            </Button>
          </ComponentWithLabel>

          <ComponentWithLabel label='메모 작성' labelWidth='10rem'>
            <TextArea placeholder={'여기에 메모를 작성해주세요.'} {...register('memo')} />
          </ComponentWithLabel>

          {/* <div>
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
          </div> */}
        </div>
      </SectionCard>
      <h3 className='font-bold-32 mt-1200 mb-600 text-black'>메인 문제 포인팅</h3>
      <div className='flex flex-col gap-800'>
        {pointingList.map((pointing, index) => {
          const concepts = ((pointing && pointing.concepts) || []) as number[];
          return (
            <div
              key={index}
              className='border-lightgray500 rounded-400 flex flex-col gap-800 border bg-white p-800'>
              <div className='flex items-center justify-between'>
                <h1 className='font-bold-20 text-black'>{index + 1}번 포인팅</h1>
                {index > 0 && (
                  <button
                    type='button'
                    onClick={() => handleDeletePointing(index)}
                    className='font-medium-16 text-red flex items-center gap-100 rounded-full border border-red-300 bg-red-100 py-200 pr-400 pl-300 break-keep whitespace-nowrap transition-colors duration-200 hover:bg-red-200/70'>
                    <IcDelete className='h-[2.4rem] w-[2.4rem] scale-70' />
                    포인팅 삭제
                  </button>
                )}
              </div>
              <ComponentWithLabel label='개념 태그'>
                <div className='flex flex-wrap gap-200'>
                  {concepts &&
                    concepts.length > 0 &&
                    concepts.map((tag) => (
                      <Tag
                        key={tag}
                        label={tagsNameMap[tag] ?? ''}
                        removable
                        color='dark'
                        onClick={() =>
                          setValue(
                            `pointings.${index}.concepts`,
                            concepts.filter((t) => t !== tag),
                            { shouldDirty: true, shouldValidate: true }
                          )
                        }
                      />
                    ))}
                  <Tag
                    label='태그 추가하기'
                    onClick={() => handleOpenMainPointingTagModal(index, concepts || [])}
                    color='lightgray'
                  />
                </div>
              </ComponentWithLabel>
              <div className='grid grid-cols-2 gap-1200'>
                <div>
                  <ComponentWithLabel label='질문' labelWidth='10rem' direction='column'>
                    <Button
                      type='button'
                      variant={hasPointingBlocks('question', index) ? 'dark' : 'light'}
                      sizeType='full'
                      onClick={() => handleOpenPointingQuestionModal(index)}>
                      {hasPointingBlocks('question', index)
                        ? '입력 확인 및 수정하기'
                        : '입력 바로가기'}
                    </Button>
                  </ComponentWithLabel>
                </div>
                <div>
                  <ComponentWithLabel label='처방' labelWidth='10rem' direction='column'>
                    <Button
                      type='button'
                      variant={hasPointingBlocks('comment', index) ? 'dark' : 'light'}
                      sizeType='full'
                      onClick={() => handleOpenPointingCommentModal(index)}>
                      {hasPointingBlocks('comment', index)
                        ? '입력 확인 및 수정하기'
                        : '입력 바로가기'}
                    </Button>
                  </ComponentWithLabel>
                </div>
              </div>
            </div>
          );
        })}

        <button
          type='button'
          onClick={handleAddPointing}
          className='font-medium-18 mx-auto flex items-center gap-300 rounded-full border bg-gray-700 px-600 py-400 break-keep whitespace-nowrap text-white transition-colors duration-200 hover:bg-gray-600'>
          <IcPlus className='h-[2.4rem] w-[2.4rem] scale-80' />
          포인팅 추가하기
        </button>
      </div>

      {/* EditorModal - 메인 문제 */}
      {isEditorModalOpen && (
        <EditorModal
          blocks={tempMainProblemBlocks || fetchedProblemData?.problemContent?.blocks || []}
          onSave={handleSaveEditor}
          onClose={handleCloseEditorModal}
          ocrApiCall={ocrMutation.mutateAsync}
        />
      )}

      {/* EditorModal - 포인팅 질문 */}
      {isPointingQuestionModalOpen && (
        <EditorModal
          blocks={
            (currentPointingIndex !== null &&
              (tempPointingQuestionBlocks[currentPointingIndex] ||
                fetchedProblemData?.pointings?.[currentPointingIndex]?.questionContent?.blocks)) ||
            []
          }
          onSave={handleSavePointingQuestion}
          onClose={handleClosePointingQuestionModal}
          ocrApiCall={ocrMutation.mutateAsync}
        />
      )}

      {/* EditorModal - 포인팅 처방 */}
      {isPointingCommentModalOpen && (
        <EditorModal
          blocks={
            (currentPointingIndex !== null &&
              (tempPointingCommentBlocks[currentPointingIndex] ||
                fetchedProblemData?.pointings?.[currentPointingIndex]?.commentContent?.blocks)) ||
            []
          }
          onSave={handleSavePointingComment}
          onClose={handleClosePointingCommentModal}
          ocrApiCall={ocrMutation.mutateAsync}
        />
      )}

      {/* TagSelectModal - 메인 포인팅 */}
      <Modal isOpen={isMainPointingTagModalOpen} onClose={closeMainPointingTagModal}>
        <TagSelectModal
          onClose={closeMainPointingTagModal}
          selectedTagList={currentMainPointingTagList}
          handleChangeTagList={handleChangeMainPointingTagList}
        />
      </Modal>
    </div>
  );
};
