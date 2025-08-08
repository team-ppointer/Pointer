import {
  AnswerInput,
  ComponentWithLabel,
  DeleteButton,
  PlusButton,
  SectionCard,
  Tag,
  Button,
} from '@components';
import { Control, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { components } from '@schema';

type ProblemUpdateRequest = components['schemas']['ProblemUpdateRequest'];
type ChildProblem = components['schemas']['ChildProblemUpdateDTO.Request'];

interface ChildProblemSectionProps {
  control: Control<ProblemUpdateRequest>;
  register: UseFormRegister<ProblemUpdateRequest>;
  watch: UseFormWatch<ProblemUpdateRequest>;
  childProblems: ChildProblem[];
  tagsNameMap: Record<number, string>;
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
  childProblems,
  tagsNameMap,
  onAddChildProblem,
  onDeleteChildProblem,
  onRemoveChildTag,
  onOpenChildTagModal,
  onAddPointing,
  onDeletePointing,
  onOpenPointingTagModal,
}: ChildProblemSectionProps) => {
  return (
    <SectionCard>
      <div className='flex items-baseline gap-[1.6rem]'>
        <h3 className='font-bold-32 text-black'>새끼 문제 등록</h3>
        <p className='font-medium-14 text-lightgray500'>
          새끼 문제은 저장 후 항목 추가가 불가능해요
        </p>
      </div>

      <div className='mt-[3.2rem] flex flex-col gap-[6.4rem]'>
        {childProblems.map((childProblem, index) => {
          const watchedConcepts = watch(`childProblems.${index}.concepts`);
          const watchedAnswerType = watch(`childProblems.${index}.answerType`);
          const watchedAnswer = watch(`childProblems.${index}.answer`);
          const watchedPointings = watch(`childProblems.${index}.pointings`);
          return (
            <div key={childProblem.id} className='grid grid-cols-2 gap-[4.8rem]'>
              <div className='flex flex-col gap-[3.2rem]'>
                <ComponentWithLabel label='새끼 문제 개념 태그'>
                  <div className='flex flex-1 flex-wrap gap-[0.8rem]'>
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
                  <Button type='button' variant='light' sizeType='full' onClick={() => {}}>
                    입력 바로가기
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
              <div className='flex flex-col gap-[3.2rem]'>
                {watchedPointings &&
                  watchedPointings.length > 0 &&
                  watchedPointings.map((pointing, pointingIndex) => (
                    <ComponentWithLabel
                      key={pointing.id}
                      label={`새끼 문제 포인팅 ${pointingIndex + 1}번`}
                      direction='column'>
                      <div className='grid w-full grid-cols-2 gap-[4.8rem]'>
                        <div>
                          <ComponentWithLabel label='질문' labelWidth='15.4rem' direction='column'>
                            <Button
                              type='button'
                              variant='light'
                              sizeType='full'
                              onClick={() => {}}>
                              입력 바로가기
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
                              variant='light'
                              sizeType='full'
                              onClick={() => {}}>
                              입력 바로가기
                            </Button>
                          </ComponentWithLabel>
                        </div>
                      </div>
                      <ComponentWithLabel label='포인팅 개념 태그'>
                        <div className='flex flex-1 flex-wrap gap-[0.8rem]'>
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
      <div className='mt-[6.4rem] flex items-center justify-center'>
        <PlusButton onClick={onAddChildProblem} />
      </div>
    </SectionCard>
  );
};
