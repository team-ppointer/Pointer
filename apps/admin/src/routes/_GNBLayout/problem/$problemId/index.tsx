import {
  AnswerInput,
  ComponentWithLabel,
  DeleteButton,
  FloatingButton,
  Header,
  ImageUpload,
  Input,
  LevelSelect,
  Modal,
  PlusButton,
  ProblemEssentialInput,
  SectionCard,
  Tag,
  TagSelectModal,
  TextArea,
  TwoButtonModalTemplate,
} from '@components';
import { components } from '@schema';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { produce } from 'immer';
import {
  deleteChildProblem,
  deleteProblems,
  getConceptTags,
  getProblemById,
  postChildProblem,
  putProblemById,
} from '@apis';
import { useEffect, useState } from 'react';
import { transformToProblemUpdateRequest } from '@utils';
import { useInvalidate, useModal } from '@hooks';
import { Slide, ToastContainer, toast } from 'react-toastify';

export const Route = createFileRoute('/_GNBLayout/problem/$problemId/')({
  component: RouteComponent,
});

type ProblemGetResponse = components['schemas']['ProblemGetResponse'];
type ProblemUpdateRequest = components['schemas']['ProblemUpdateRequest'];

function RouteComponent() {
  // hooks
  const { invalidateAll } = useInvalidate();
  const { navigate } = useRouter();
  const { problemId } = Route.useParams();
  const { isOpen: isTagModalOpen, openModal: openTagModal, closeModal: closeTagModal } = useModal();
  const {
    isOpen: isChildTagModalOpen,
    openModal: openChildTagModal,
    closeModal: closeChildTagModal,
  } = useModal();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const [currentChildTagList, setCurrentChildTagList] = useState<number[]>([]);
  const [currentChildIndex, setCurrentChildIndex] = useState<number>();

  // api
  const { data: fetchedProblemData } = getProblemById(Number(problemId));
  const { mutate: mutateUpdateProblem } = putProblemById();
  const { mutate: mutateAddChildProblem } = postChildProblem();
  const { mutate: mutateDeleteChildProblem } = deleteChildProblem();
  const { mutate: mutateDeleteProblem } = deleteProblems();
  const { data: tagsData } = getConceptTags();
  const allTagList = tagsData?.data || [];
  const tagsNameMap = Object.fromEntries(allTagList.map((tag) => [tag.id, tag.name]));

  // RHF
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: transformToProblemUpdateRequest({} as ProblemGetResponse),
  });

  const problemCustomId = fetchedProblemData?.data.problemCustomId ?? '';
  const problemType = watch('problemType');
  const conceptTagIds = watch('conceptTagIds');
  const selectedAnswerType = watch('answerType');
  const selectedAnswer = watch('answer');
  const prescriptionImageUrls = watch('prescriptionImageUrls');

  const {
    fields: childProblems,
    append,
    remove,
    update,
  } = useFieldArray({
    control,
    name: 'updateChildProblems',
  });

  // api call functions
  const handleAddChildProblem = () => {
    mutateAddChildProblem(
      {
        params: {
          path: {
            problemId: Number(problemId),
          },
        },
      },
      {
        onSuccess: (data) => {
          append({
            childProblemId: data.data.id,
            conceptTagIds: [],
            imageUrl: '',
            answerType: 'MULTIPLE_CHOICE',
            answer: '',
            prescriptionImageUrls: [''],
          });
        },
      }
    );
  };

  const handleDeleteChildProblem = (childProblemId: number, index: number) => {
    mutateDeleteChildProblem(
      {
        params: {
          path: {
            problemId: Number(problemId),
            childProblemId: childProblemId,
          },
        },
      },
      {
        onSuccess: () => {
          remove(index);
        },
      }
    );
  };

  // functions
  const handleSubmitUpdate: SubmitHandler<ProblemUpdateRequest> = (data) => {
    mutateUpdateProblem(
      {
        body: {
          ...data,
        },
        params: {
          path: {
            id: Number(problemId),
          },
        },
      },
      {
        onSuccess: () => {
          invalidateAll();
          toast.success('저장이 완료되었습니다');
        },
      }
    );
  };

  const handleMutateDelete = () => {
    mutateDeleteProblem(
      {
        params: {
          path: {
            id: Number(problemId),
          },
        },
      },
      {
        onSuccess: () => {
          invalidateAll();
          navigate({ to: '/problem' });
        },
      }
    );
  };

  const handleChangeTagList = (tagList: number[]) => {
    const newTagList = tagList.map((tag) => tag);
    setValue('conceptTagIds', newTagList);
  };

  const handleRemoveTag = (tag: number) => {
    const newTagList = conceptTagIds.filter((t) => t !== tag);
    setValue('conceptTagIds', newTagList);
  };

  const handleChangeChildTagList = (tagList: number[], index: number | undefined) => {
    if (index === undefined) return;
    const newChildProblem = produce(childProblems[index], (draft) => {
      if (draft) {
        draft.conceptTagIds = [...tagList];
      }
    });

    if (newChildProblem) {
      update(index, newChildProblem);
    }
  };

  const handleRemoveChildTag = (tagId: number, index: number) => {
    const newChildProblem = produce(childProblems[index], (draft) => {
      if (draft) {
        draft.conceptTagIds = draft.conceptTagIds.filter((tag) => tag !== tagId);
      }
    });
    if (newChildProblem) {
      update(index, newChildProblem);
    }
  };

  const handleChangeChildProblemImage = (newImageUrl: string, index: number) => {
    const newChildProblem = produce(childProblems[index], (draft) => {
      if (draft) {
        draft.imageUrl = newImageUrl;
      }
    });
    if (newChildProblem) {
      update(index, newChildProblem);
    }
  };

  const handleChangeChildPrescriptionImage = (newImageUrl: string, index: number) => {
    const newChildProblem = produce(childProblems[index], (draft) => {
      if (draft) {
        // 추후 확장성을 고려해 배열로 관리되지만, 현재는 1개만 저장
        draft.prescriptionImageUrls = [newImageUrl];
      }
    });
    if (newChildProblem) {
      update(index, newChildProblem);
    }
  };

  const handleAddPrescription = () => {
    const newPrescriptionImageUrls = [...(prescriptionImageUrls || [])];
    newPrescriptionImageUrls.push('');
    setValue('prescriptionImageUrls', newPrescriptionImageUrls);
  };

  const handleChangePrescriptionImageUrl = (imageUrl: string, index: number) => {
    const updatedUrls = [...(prescriptionImageUrls || [])];
    updatedUrls[index] = imageUrl;
    setValue('prescriptionImageUrls', updatedUrls);
  };

  const handleDeletePrescription = (index: number) => {
    const updatedUrls = [...(prescriptionImageUrls || [])];
    updatedUrls.splice(index, 1);
    setValue('prescriptionImageUrls', updatedUrls);
  };

  // useEffect
  useEffect(() => {
    if (fetchedProblemData) {
      reset(transformToProblemUpdateRequest(fetchedProblemData.data)); // 응답 -> 수정에 맞게 데이터 변환
    }
  }, [fetchedProblemData]);

  return (
    <>
      <ToastContainer
        position='top-center'
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        draggable
        pauseOnHover
        theme='dark'
        transition={Slide}
        style={{
          fontSize: '1.6rem',
        }}
      />
      <form onSubmit={handleSubmit(handleSubmitUpdate)}>
        <Header
          title={`문항 ID : ${problemCustomId}`}
          deleteButton='문항 삭제'
          onClickDelete={openDeleteModal}
        />
        <ProblemEssentialInput>
          <Controller
            control={control}
            name='problemType'
            render={({ field }) => (
              <ProblemEssentialInput.ProblemTypeSection
                problemType={field.value}
                handleChangeType={(type) => {
                  clearErrors();
                  if (type === 'CREATION_PROBLEM') {
                    setValue('practiceTestId', undefined);
                    setValue('number', undefined);
                  }
                  field.onChange(type);
                }}
              />
            )}
          />
          {problemType !== 'CREATION_PROBLEM' && (
            <ProblemEssentialInput.PracticeTestSection>
              <Controller
                control={control}
                name='practiceTestId'
                rules={{
                  required: '모의고사와 문항 번호는 필수 입력 항목입니다.',
                }}
                render={({ field }) => (
                  <ProblemEssentialInput.PracticeTest
                    practiceTest={field.value}
                    handlePracticeTest={field.onChange}
                  />
                )}
              />
              <ProblemEssentialInput.PraticeTestNumber
                {...register('number', {
                  valueAsNumber: true,
                  required: '모의고사와 문항 번호는 필수 입력 항목입니다.',
                })}
              />
            </ProblemEssentialInput.PracticeTestSection>
          )}
          <ProblemEssentialInput.ProblemError
            isError={Boolean(errors.practiceTestId || errors.number)}
            errorMessage='모의고사와 문항 번호는 필수 입력 항목입니다.'
          />
        </ProblemEssentialInput>
        <div className='mt-[4.8rem] flex flex-col gap-[4.8rem]'>
          <SectionCard>
            <div className='flex flex-col gap-[3.2rem]'>
              <ComponentWithLabel label='메인 문항 타이틀 입력' labelWidth='15.4rem'>
                <Input {...register('title')} />
              </ComponentWithLabel>
              <ComponentWithLabel label='메인 문항 개념 태그' labelWidth='15.4rem'>
                <div className='flex flex-wrap gap-[0.8rem]'>
                  {conceptTagIds.length > 0 &&
                    conceptTagIds.map((tag) => (
                      <Tag
                        key={tag}
                        label={tagsNameMap[tag] ?? ''}
                        removable
                        color='dark'
                        onClick={() => handleRemoveTag(tag)}
                      />
                    ))}
                  <Tag label='태그 추가하기' onClick={openTagModal} color='lightgray' />
                </div>
              </ComponentWithLabel>
              <ComponentWithLabel label='메인 문항 답 입력' labelWidth='15.4rem'>
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
              <div className='flex w-full items-center justify-between'>
                <ComponentWithLabel label='난이도 선택' labelWidth='15.4rem'>
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
                          {...register('recommendedMinute', {
                            valueAsNumber: true,
                          })}
                        />
                        <span className='font-medium-18 text-black'>분</span>
                      </div>
                      <div className='flex items-center gap-[1.6rem]'>
                        <input
                          className='font-bold-18 border-lightgray500 h-[5.6rem] w-[5.6rem] rounded-[16px] border bg-white px-[1.6rem] py-[0.8rem]'
                          {...register('recommendedSecond', {
                            valueAsNumber: true,
                          })}
                        />
                        <span className='font-medium-18 text-black'>초</span>
                      </div>
                    </div>
                  </ComponentWithLabel>
                </div>
              </div>

              <div className='grid grid-cols-3 gap-x-[4.8rem]'>
                <div>
                  <ComponentWithLabel label='메인 문항 선택' direction='column'>
                    <Controller
                      control={control}
                      name='mainProblemImageUrl'
                      render={({ field }) => (
                        <ImageUpload
                          problemId={problemId}
                          imageType='MAIN_PROBLEM'
                          imageUrl={field.value}
                          handleChangeImageUrl={field.onChange}
                        />
                      )}
                    />
                  </ComponentWithLabel>
                </div>
                <div>
                  <ComponentWithLabel label='메인 문항 분석 선택' direction='column'>
                    <Controller
                      control={control}
                      name='mainAnalysisImageUrl'
                      render={({ field }) => (
                        <ImageUpload
                          problemId={problemId}
                          imageType='MAIN_ANALYSIS'
                          imageUrl={field.value}
                          handleChangeImageUrl={field.onChange}
                        />
                      )}
                    />
                  </ComponentWithLabel>
                </div>
                <div>
                  <ComponentWithLabel label='메인 문항 손해설 선택' direction='column'>
                    <Controller
                      control={control}
                      name='mainHandwritingExplanationImageUrl'
                      render={({ field }) => (
                        <ImageUpload
                          problemId={problemId}
                          imageType='MAIN_HANDWRITING_EXPLANATION'
                          imageUrl={field.value}
                          handleChangeImageUrl={field.onChange}
                        />
                      )}
                    />
                  </ComponentWithLabel>
                </div>
              </div>

              <ComponentWithLabel label='문항 메모' direction='column'>
                <TextArea placeholder={'여기에 메모를 작성해주세요.'} {...register('memo')} />
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
            <div className='mt-[3.2rem] grid grid-cols-2 gap-x-[4.8rem] gap-y-[6.4rem]'>
              {childProblems.map((childProblem, index) => {
                const watchedConceptTagIds = watch(`updateChildProblems.${index}.conceptTagIds`);
                const watchedAnswerType = watch(`updateChildProblems.${index}.answerType`);
                const watchedAnswer = watch(`updateChildProblems.${index}.answer`);
                return (
                  <div key={childProblem.id} className='flex flex-col gap-[3.2rem]'>
                    <ComponentWithLabel label='새끼 문항 개념 태그'>
                      <div className='flex flex-1 flex-wrap gap-[0.8rem]'>
                        {watchedConceptTagIds.length > 0 &&
                          watchedConceptTagIds.map((tag, tagIndex) => (
                            <Tag
                              key={tag}
                              label={tagsNameMap[tag] ?? ''}
                              removable
                              color='dark'
                              onClick={() => handleRemoveChildTag(tag, tagIndex)}
                            />
                          ))}
                        <Tag
                          label='태그 추가하기'
                          onClick={() => {
                            setCurrentChildIndex(index);
                            setCurrentChildTagList(watchedConceptTagIds);
                            openChildTagModal();
                          }}
                          color='lightgray'
                        />
                      </div>
                      <DeleteButton
                        size='small'
                        type='button'
                        label='문항 삭제'
                        onClick={() => handleDeleteChildProblem(childProblem.childProblemId, index)}
                      />
                    </ComponentWithLabel>
                    <ComponentWithLabel label='새끼 문항 선택' direction='column'>
                      <ImageUpload
                        problemId={problemId}
                        imageType='CHILD_PROBLEM'
                        imageUrl={childProblem.imageUrl}
                        handleChangeImageUrl={(newImageUrl) =>
                          handleChangeChildProblemImage(newImageUrl, index)
                        }
                      />
                    </ComponentWithLabel>
                    <ComponentWithLabel label='새끼 문항 답 입력'>
                      <AnswerInput>
                        <AnswerInput.AnswerTypeSection
                          selectedAnswerType={watchedAnswerType}
                          {...register(`updateChildProblems.${index}.answerType`)}
                        />
                        <AnswerInput.AnswerInputSection
                          selectedAnswerType={watchedAnswerType}
                          selectedAnswer={watchedAnswer}
                          {...register(`updateChildProblems.${index}.answer`)}
                        />
                      </AnswerInput>
                    </ComponentWithLabel>
                    <ComponentWithLabel label='새끼 문제 진단 및 처방 선택' direction='column'>
                      <ImageUpload
                        problemId={problemId}
                        imageType='CHILD_PRESCRIPTION'
                        imageUrl={childProblem.prescriptionImageUrls[0]}
                        handleChangeImageUrl={(newImageUrl) =>
                          handleChangeChildPrescriptionImage(newImageUrl, index)
                        }
                      />
                    </ComponentWithLabel>
                  </div>
                );
              })}
              <div className='flex items-center'>
                <PlusButton onClick={handleAddChildProblem} />
              </div>
            </div>
          </SectionCard>
          <SectionCard>
            <h6 className='font-bold-32 text-black'>TIP</h6>
            <div className='mt-[4.8rem] grid grid-cols-2 gap-[4.8rem]'>
              <div>
                <ComponentWithLabel label='문항을 읽어내려갈 때' direction='column'>
                  <Controller
                    control={control}
                    name='readingTipImageUrl'
                    render={({ field }) => (
                      <ImageUpload
                        problemId={problemId}
                        imageType='READING_TIP'
                        imageUrl={field.value}
                        handleChangeImageUrl={field.onChange}
                      />
                    )}
                  />
                </ComponentWithLabel>
              </div>
              <div>
                <ComponentWithLabel label='1등급 선배가 해주는 조언' direction='column'>
                  <Controller
                    control={control}
                    name='seniorTipImageUrl'
                    render={({ field }) => (
                      <ImageUpload
                        problemId={problemId}
                        imageType='SENIOR_TIP'
                        imageUrl={field.value}
                        handleChangeImageUrl={field.onChange}
                      />
                    )}
                  />
                </ComponentWithLabel>
              </div>
            </div>
            <div className='bg-lightgray300 my-[4.8rem] h-[2px] w-full' />
            <h6 className='font-medium-18 mt-[3.2rem] text-black'>진단 및 처방</h6>
            <div className='mt-[2.4rem] grid grid-cols-2 gap-x-[4.8rem] gap-y-[2.4rem]'>
              {prescriptionImageUrls?.map((url, index) => {
                return (
                  <ImageUpload
                    key={`prescription-${index}`}
                    problemId={problemId}
                    imageType='MAIN_PRESCRIPTION'
                    imageUrl={url}
                    handleChangeImageUrl={(imageUrl: string) =>
                      handleChangePrescriptionImageUrl(imageUrl, index)
                    }
                    handleClickDelete={() => handleDeletePrescription(index)}
                  />
                );
              })}
              <div className='flex items-center'>
                <PlusButton onClick={handleAddPrescription} />
              </div>
            </div>
          </SectionCard>
        </div>
        <FloatingButton>저장하기</FloatingButton>
      </form>
      <Modal isOpen={isTagModalOpen} onClose={closeTagModal}>
        <TagSelectModal
          onClose={closeTagModal}
          selectedTagList={conceptTagIds}
          handleChangeTagList={handleChangeTagList}
        />
      </Modal>
      <Modal isOpen={isChildTagModalOpen} onClose={closeChildTagModal}>
        <TagSelectModal
          onClose={closeChildTagModal}
          selectedTagList={currentChildTagList}
          handleChangeTagList={(tagList) => handleChangeChildTagList(tagList, currentChildIndex)}
        />
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text='문항을 삭제할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={handleMutateDelete}
        />
      </Modal>
    </>
  );
}
