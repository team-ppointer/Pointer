import { useState } from 'react';
import {
  AnswerInput,
  ComponentWithLabel,
  DeleteButton,
  PlusButton,
  SectionCard,
  Tag,
  Button,
} from '@components';
import { Control, UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { components } from '@schema';
import EditorModal from '@repo/pointer-editor/EditorModal';

type ProblemUpdateRequest = components['schemas']['ProblemUpdateRequest'];
type ChildProblem = components['schemas']['ChildProblemUpdateDTO.Request'];
type ProblemInfoResp = components['schemas']['ProblemInfoResp'];
type ContentBlockUpdateRequest = components['schemas']['ContentBlockUpdateRequest'];

interface ChildProblemSectionProps {
  control: Control<ProblemUpdateRequest>;
  register: UseFormRegister<ProblemUpdateRequest>;
  watch: UseFormWatch<ProblemUpdateRequest>;
  setValue: UseFormSetValue<ProblemUpdateRequest>;
  childProblems: ChildProblem[];
  tagsNameMap: Record<number, string>;
  fetchedProblemData?: ProblemInfoResp;
  onAddChildProblem: () => void;
  onDeleteChildProblem: (index: number) => void;
  onRemoveChildTag: (tagId: number, index: number) => void;
  onOpenChildTagModal: (index: number, concepts: number[]) => void;
  onAddPointing: (childProblemIndex: number) => void;
  onDeletePointing: (childProblemIndex: number, pointingIndex: number) => void;
  onOpenPointingTagModal: (
    childProblemIndex: number,
    pointingIndex: number,
    concepts: number[]
  ) => void;
}

export const ChildProblemSection = ({
  control: _control,
  register,
  watch,
  setValue,
  childProblems,
  tagsNameMap,
  fetchedProblemData,
  onAddChildProblem,
  onDeleteChildProblem,
  onRemoveChildTag,
  onOpenChildTagModal,
  onAddPointing,
  onDeletePointing,
  onOpenPointingTagModal,
}: ChildProblemSectionProps) => {
  // EditorModal 상태 관리
  const [editorModalState, setEditorModalState] = useState<{
    isOpen: boolean;
    type: 'childProblem' | 'pointingQuestion' | 'pointingComment';
    childIndex: number;
    pointingIndex?: number;
  }>({
    isOpen: false,
    type: 'childProblem',
    childIndex: 0,
  });

  // 임시로 수정된 블록들을 저장하는 상태
  const [tempChildProblemBlocks, setTempChildProblemBlocks] = useState<
    Record<number, unknown[] | null>
  >({});
  const [tempPointingQuestionBlocks, setTempPointingQuestionBlocks] = useState<
    Record<string, unknown[] | null>
  >({});
  const [tempPointingCommentBlocks, setTempPointingCommentBlocks] = useState<
    Record<string, unknown[] | null>
  >({});

  const handleOpenEditorModal = (
    type: 'childProblem' | 'pointingQuestion' | 'pointingComment',
    childIndex: number,
    pointingIndex?: number
  ) => {
    setEditorModalState({
      isOpen: true,
      type,
      childIndex,
      pointingIndex,
    });
  };

  const handleCloseEditorModal = () => {
    setEditorModalState({
      isOpen: false,
      type: 'childProblem',
      childIndex: 0,
    });
  };

  const formatBlocks = (blocks: unknown[]): ContentBlockUpdateRequest[] => {
    return blocks.map((block, index) => {
      const blockData = block as {
        // id?: number;
        type?: 'TEXT' | 'IMAGE';
        data?: string;
        content?: string;
      };

      return {
        // id: blockData.id || 0,
        rank: index,
        type: blockData.type,
        data: blockData.data || blockData.content,
      };
    });
  };

  const handleSaveEditor = (blocks: unknown[]) => {
    const formattedBlocks = formatBlocks(blocks);
    const { type, childIndex, pointingIndex } = editorModalState;

    if (type === 'childProblem') {
      setValue(`childProblems.${childIndex}.problemContent.blocks`, formattedBlocks);
      setTempChildProblemBlocks((prev) => ({
        ...prev,
        [childIndex]: blocks,
      }));
      console.log(`Updated childProblem ${childIndex} blocks:`, formattedBlocks);
    } else if (type === 'pointingQuestion' && pointingIndex !== undefined) {
      setValue(
        `childProblems.${childIndex}.pointings.${pointingIndex}.questionContent.blocks`,
        formattedBlocks
      );
      const key = `${childIndex}-${pointingIndex}-question`;
      setTempPointingQuestionBlocks((prev) => ({
        ...prev,
        [key]: blocks,
      }));
      console.log(
        `Updated pointing question ${childIndex}-${pointingIndex} blocks:`,
        formattedBlocks
      );
    } else if (type === 'pointingComment' && pointingIndex !== undefined) {
      setValue(
        `childProblems.${childIndex}.pointings.${pointingIndex}.commentContent.blocks`,
        formattedBlocks
      );
      const key = `${childIndex}-${pointingIndex}-comment`;
      setTempPointingCommentBlocks((prev) => ({
        ...prev,
        [key]: blocks,
      }));
      console.log(
        `Updated pointing comment ${childIndex}-${pointingIndex} blocks:`,
        formattedBlocks
      );
    }

    handleCloseEditorModal();
  };

  const getEditorBlocks = () => {
    const { type, childIndex, pointingIndex } = editorModalState;

    if (type === 'childProblem') {
      return (
        tempChildProblemBlocks[childIndex] ||
        fetchedProblemData?.childProblems?.[childIndex]?.problemContent?.blocks ||
        []
      );
    } else if (type === 'pointingQuestion' && pointingIndex !== undefined) {
      const key = `${childIndex}-${pointingIndex}-question`;
      return (
        tempPointingQuestionBlocks[key] ||
        fetchedProblemData?.childProblems?.[childIndex]?.pointings?.[pointingIndex]?.questionContent
          ?.blocks ||
        []
      );
    } else if (type === 'pointingComment' && pointingIndex !== undefined) {
      const key = `${childIndex}-${pointingIndex}-comment`;
      return (
        tempPointingCommentBlocks[key] ||
        fetchedProblemData?.childProblems?.[childIndex]?.pointings?.[pointingIndex]?.commentContent
          ?.blocks ||
        []
      );
    }

    return [];
  };

  const hasBlocks = (
    type: 'childProblem' | 'pointingQuestion' | 'pointingComment',
    childIndex: number,
    pointingIndex?: number
  ): boolean => {
    if (type === 'childProblem') {
      const tempBlocks = tempChildProblemBlocks[childIndex];
      const fetchedBlocks = fetchedProblemData?.childProblems?.[childIndex]?.problemContent?.blocks;
      return (
        (tempBlocks && tempBlocks.length > 0) ||
        (fetchedBlocks && fetchedBlocks.length > 0) ||
        false
      );
    } else if (type === 'pointingQuestion' && pointingIndex !== undefined) {
      const key = `${childIndex}-${pointingIndex}-question`;
      const tempBlocks = tempPointingQuestionBlocks[key];
      const fetchedBlocks =
        fetchedProblemData?.childProblems?.[childIndex]?.pointings?.[pointingIndex]?.questionContent
          ?.blocks;
      return (
        (tempBlocks && tempBlocks.length > 0) ||
        (fetchedBlocks && fetchedBlocks.length > 0) ||
        false
      );
    } else if (type === 'pointingComment' && pointingIndex !== undefined) {
      const key = `${childIndex}-${pointingIndex}-comment`;
      const tempBlocks = tempPointingCommentBlocks[key];
      const fetchedBlocks =
        fetchedProblemData?.childProblems?.[childIndex]?.pointings?.[pointingIndex]?.commentContent
          ?.blocks;
      return (
        (tempBlocks && tempBlocks.length > 0) ||
        (fetchedBlocks && fetchedBlocks.length > 0) ||
        false
      );
    }
    return false;
  };

  return (
    <SectionCard>
      <div className='flex items-baseline gap-[1.6rem]'>
        <h3 className='font-bold-32 text-black'>새끼 문제 등록</h3>
        <p className='font-medium-14 text-lightgray500'>
          새끼 문제은 저장 후 항목 추가가 불가능해요
        </p>
      </div>

      <div className='mt-800 flex flex-col gap-1600'>
        {childProblems.map((childProblem, index) => {
          const watchedConcepts = watch(`childProblems.${index}.concepts`);
          const watchedAnswerType = watch(`childProblems.${index}.answerType`);
          const watchedAnswer = watch(`childProblems.${index}.answer`);
          const watchedPointings = watch(`childProblems.${index}.pointings`);
          return (
            <div key={childProblem.id} className='grid grid-cols-2 gap-1200'>
              <div className='flex flex-col gap-800'>
                <ComponentWithLabel label='새끼 문제 개념 태그'>
                  <div className='flex flex-1 flex-wrap gap-200'>
                    {watchedConcepts &&
                      watchedConcepts.length > 0 &&
                      watchedConcepts.map((tag, _tagIndex) => (
                        <Tag
                          key={tag}
                          label={tagsNameMap[tag] ?? ''}
                          removable
                          color='dark'
                          onClick={() => onRemoveChildTag(tag, index)}
                        />
                      ))}
                    <Tag
                      label='태그 추가하기'
                      onClick={() => onOpenChildTagModal(index, watchedConcepts || [])}
                      color='lightgray'
                    />
                  </div>
                  <DeleteButton
                    size='small'
                    type='button'
                    label='문제 삭제'
                    onClick={() => onDeleteChildProblem(index)}
                  />
                </ComponentWithLabel>
                <ComponentWithLabel label='새끼 문제 입력' labelWidth='15.4rem' direction='column'>
                  <Button
                    type='button'
                    variant={hasBlocks('childProblem', index) ? 'dark' : 'light'}
                    sizeType='full'
                    onClick={() => handleOpenEditorModal('childProblem', index)}>
                    {hasBlocks('childProblem', index) ? '입력 확인 및 수정하기' : '입력 바로가기'}
                  </Button>
                </ComponentWithLabel>
                <ComponentWithLabel label='새끼 문제 답 입력'>
                  <AnswerInput>
                    <AnswerInput.AnswerTypeSection
                      selectedAnswerType={watchedAnswerType}
                      {...register(`childProblems.${index}.answerType`)}
                    />
                    <AnswerInput.AnswerInputSection
                      selectedAnswerType={watchedAnswerType}
                      selectedAnswer={watchedAnswer}
                      {...register(`childProblems.${index}.answer`, { valueAsNumber: true })}
                    />
                  </AnswerInput>
                </ComponentWithLabel>
              </div>
              <div className='flex flex-col gap-800'>
                {watchedPointings &&
                  watchedPointings.length > 0 &&
                  watchedPointings.map((pointing, pointingIndex) => (
                    <ComponentWithLabel
                      key={pointing.id}
                      label={`새끼 문제 포인팅 ${pointingIndex + 1}번`}
                      direction='column'>
                      <div className='grid w-full grid-cols-2 gap-1200'>
                        <div>
                          <ComponentWithLabel label='질문' labelWidth='15.4rem' direction='column'>
                            <Button
                              type='button'
                              variant={
                                hasBlocks('pointingQuestion', index, pointingIndex)
                                  ? 'dark'
                                  : 'light'
                              }
                              sizeType='full'
                              onClick={() =>
                                handleOpenEditorModal('pointingQuestion', index, pointingIndex)
                              }>
                              {hasBlocks('pointingQuestion', index, pointingIndex)
                                ? '입력 확인 및 수정하기'
                                : '입력 바로가기'}
                            </Button>
                          </ComponentWithLabel>
                        </div>
                        <div>
                          <ComponentWithLabel
                            label='코멘트'
                            labelWidth='15.4rem'
                            direction='column'>
                            <Button
                              type='button'
                              variant={
                                hasBlocks('pointingComment', index, pointingIndex)
                                  ? 'dark'
                                  : 'light'
                              }
                              sizeType='full'
                              onClick={() =>
                                handleOpenEditorModal('pointingComment', index, pointingIndex)
                              }>
                              {hasBlocks('pointingComment', index, pointingIndex)
                                ? '입력 확인 및 수정하기'
                                : '입력 바로가기'}
                            </Button>
                          </ComponentWithLabel>
                        </div>
                      </div>
                      <ComponentWithLabel label='포인팅 개념 태그'>
                        <div className='flex flex-1 flex-wrap gap-200'>
                          {pointing.concepts &&
                            pointing.concepts.length > 0 &&
                            pointing.concepts.map((tag, _tagIndex) => (
                              <Tag
                                key={tag}
                                label={tagsNameMap[tag] ?? ''}
                                removable
                                color='dark'
                                // onClick={() => onRemoveChildTag(tag, index)}
                              />
                            ))}
                          <Tag
                            label='태그 추가하기'
                            onClick={() =>
                              onOpenPointingTagModal(index, pointingIndex, pointing.concepts || [])
                            }
                            color='lightgray'
                          />
                        </div>
                        <DeleteButton
                          size='small'
                          type='button'
                          label='포인팅 삭제'
                          onClick={() => onDeletePointing(index, pointingIndex)}
                        />
                      </ComponentWithLabel>
                    </ComponentWithLabel>
                  ))}
                <div className='flex items-center justify-center'>
                  <PlusButton onClick={() => onAddPointing(index)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className='mt-1600 flex items-center justify-center'>
        <PlusButton onClick={onAddChildProblem} />
      </div>

      {/* EditorModal */}
      {editorModalState.isOpen && (
        <EditorModal
          blocks={getEditorBlocks()}
          onSave={handleSaveEditor}
          onClose={handleCloseEditorModal}
        />
      )}
    </SectionCard>
  );
};
