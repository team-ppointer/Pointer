import { FloatingButton, Header, Modal, TagSelectModal, TwoButtonModalTemplate } from '@components';
import { components } from '@schema';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { produce } from 'immer';
import { deleteProblem, getConcept, getProblemById, putProblemById } from '@apis';
import { useEffect, useState } from 'react';
import { transformToProblemUpdateRequest } from '@utils';
import { useInvalidate, useModal } from '@hooks';
import { Slide, ToastContainer, toast } from 'react-toastify';

import {
  ProblemEssentialInput,
  MainProblemSection,
  ChildProblemSection,
  TipSection,
} from '@/components/problem';
import { Button } from '@/components/common';
import CreatePracticeTestModal from '@/components/common/Modals/CreatePracticeTestModal';

export const Route = createFileRoute('/_GNBLayout/problem/$problemId/')({
  component: RouteComponent,
});

type ProblemInfoResp = components['schemas']['ProblemInfoResp'];
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
    isOpen: isPointingTagModalOpen,
    openModal: openPointingTagModal,
    closeModal: closePointingTagModal,
  } = useModal();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();
  const {
    isOpen: isCreatePracticeTestModalOpen,
    openModal: openCreatePracticeTestModal,
    closeModal: closeCreatePracticeTestModal,
  } = useModal();

  const [currentChildTagList, setCurrentChildTagList] = useState<number[]>([]);
  const [currentChildIndex, setCurrentChildIndex] = useState<number>();
  const [currentPointingTagList, setCurrentPointingTagList] = useState<number[]>([]);
  const [currentPointingIndex, setCurrentPointingIndex] = useState<{
    childIndex: number;
    pointingIndex: number;
  }>();

  // api
  const { data: fetchedProblemData } = getProblemById({ id: Number(problemId) });
  const { mutate: mutateUpdateProblem } = putProblemById();
  const { mutate: mutateDeleteProblem } = deleteProblem();
  const { data: tagsData } = getConcept();
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
    defaultValues: transformToProblemUpdateRequest({} as ProblemInfoResp),
  });

  const problemCustomId = fetchedProblemData?.customId ?? '';
  const problemType = watch('problemType');
  const concepts = watch('concepts');
  const selectedAnswerType = watch('answerType');
  const selectedAnswer = watch('answer');

  const {
    fields: childProblems,
    append,
    remove,
    update,
  } = useFieldArray({
    control,
    name: 'childProblems',
  });

  const handleAddChildProblem = () => {
    append({
      id: undefined,
      no: childProblems.length + 1,
      problemContent: {
        blocks: [],
      },
      answerType: 'MULTIPLE_CHOICE',
      answer: 1,
      concepts: [],
      pointings: [],
    });
  };

  const handleDeleteChildProblem = (index: number) => {
    remove(index);
  };

  // functions
  const handleSubmitUpdate: SubmitHandler<ProblemUpdateRequest> = (data) => {
    const processedData = {
      ...data,
      // 이미지 ID가 undefined인 경우 명시적으로 undefined로 설정 (삭제 의미)
      mainAnalysisImageId: data.mainAnalysisImageId ?? undefined,
      mainHandAnalysisImageId: data.mainHandAnalysisImageId ?? undefined,
      childProblems: data.childProblems?.map((child) => ({
        ...child,
        id: child.id && typeof child.id === 'string' ? undefined : child.id, // 새로 생성되는 경우 undefined로 명시
      })),
      // readingTipContent, oneStepMoreContent에 id 추가
      readingTipContent: {
        id: data.readingTipContent?.id ?? undefined, // 명시적으로 undefined 설정
        blocks: data.readingTipContent?.blocks || [],
      },
      oneStepMoreContent: {
        id: data.oneStepMoreContent?.id ?? undefined, // 명시적으로 undefined 설정
        blocks: data.oneStepMoreContent?.blocks || [],
      },
    };

    console.log('최종 전송 데이터:', JSON.stringify(processedData, null, 2));

    mutateUpdateProblem(
      {
        body: processedData,
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
        onError: (error: unknown) => {
          console.error('저장 실패 상세:', error);
          if (error && typeof error === 'object' && 'response' in error) {
            console.error(
              '에러 응답:',
              (error as { response?: { data?: unknown } }).response?.data
            );
          }
          toast.error('저장에 실패했습니다');
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
    setValue('concepts', newTagList);
  };

  const handleRemoveTag = (tag: number) => {
    const newTagList = concepts?.filter((t) => t !== tag);
    setValue('concepts', newTagList);
  };

  const handleChangeChildTagList = (tagList: number[], index: number | undefined) => {
    if (index === undefined) return;
    const newChildProblem = produce(childProblems[index], (draft) => {
      if (draft) {
        draft.concepts = [...tagList];
      }
    });

    if (newChildProblem) {
      update(index, newChildProblem);
    }
  };

  const handleRemoveChildTag = (tagId: number, index: number) => {
    const newChildProblem = produce(childProblems[index], (draft) => {
      if (draft) {
        draft.concepts = draft.concepts?.filter((tag) => tag !== tagId);
      }
    });
    if (newChildProblem) {
      update(index, newChildProblem);
    }
  };

  const handleAddPointing = (childProblemIndex: number) => {
    const newChildProblem = produce(childProblems[childProblemIndex], (draft) => {
      if (draft) {
        if (!draft.pointings) {
          draft.pointings = [];
        }
        // PointingCreateRequest를 PointingUpdateRequest 형태로 변환
        const pointingForUpdate: components['schemas']['PointingUpdateRequest'] = {
          id: undefined, // 새로 생성되는 경우 undefined
          no: (draft.pointings?.length ?? 0) + 1,
          questionContent: { blocks: [] },
          commentContent: { blocks: [] },
          concepts: [],
        };
        draft.pointings.push(pointingForUpdate);
      }
    });
    if (newChildProblem) {
      update(childProblemIndex, newChildProblem);
    }
  };

  const handleDeletePointing = (childProblemIndex: number, pointingIndex: number) => {
    const newChildProblem = produce(childProblems[childProblemIndex], (draft) => {
      if (draft && draft.pointings) {
        draft.pointings.splice(pointingIndex, 1);
        // 포인팅 번호 재정렬
        draft.pointings.forEach((pointing, index) => {
          pointing.no = index + 1;
        });
      }
    });
    if (newChildProblem) {
      update(childProblemIndex, newChildProblem);
    }
  };

  const handleChangePointingTagList = (
    tagList: number[],
    pointingIndex: { childIndex: number; pointingIndex: number } | undefined
  ) => {
    if (!pointingIndex) return;
    const { childIndex, pointingIndex: pIndex } = pointingIndex;
    const newChildProblem = produce(childProblems[childIndex], (draft) => {
      if (draft && draft.pointings && draft.pointings[pIndex]) {
        draft.pointings[pIndex].concepts = [...tagList];
      }
    });

    if (newChildProblem) {
      update(childIndex, newChildProblem);
    }
  };

  // useEffect
  useEffect(() => {
    if (fetchedProblemData) {
      reset(transformToProblemUpdateRequest(fetchedProblemData));
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
          title={`문제 ID : ${problemCustomId}`}
          deleteButton='문제 삭제'
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
                    setValue('practiceTestNo', undefined);
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
                  required: '모의고사와 문제 번호는 필수 입력 항목입니다.',
                }}
                render={({ field }) => (
                  <ProblemEssentialInput.PracticeTest
                    practiceTest={field.value}
                    handlePracticeTest={field.onChange}
                  />
                )}
              />
              <Button
                type='button'
                variant='light'
                sizeType='fit'
                onClick={openCreatePracticeTestModal}>
                모의고사 새로 추가
              </Button>
              <ProblemEssentialInput.PraticeTestNumber
                {...register('practiceTestNo', {
                  valueAsNumber: true,
                  required: '모의고사와 문제 번호는 필수 입력 항목입니다.',
                })}
              />
            </ProblemEssentialInput.PracticeTestSection>
          )}
          <ProblemEssentialInput.ProblemError
            isError={Boolean(errors.practiceTestId || errors.practiceTestNo)}
            errorMessage='모의고사와 문제 번호는 필수 입력 항목입니다.'
          />
        </ProblemEssentialInput>
        <div className='mt-[4.8rem] flex flex-col gap-[4.8rem]'>
          <MainProblemSection
            control={control}
            register={register}
            errors={errors}
            concepts={concepts}
            selectedAnswerType={selectedAnswerType}
            selectedAnswer={selectedAnswer}
            tagsNameMap={tagsNameMap}
            fetchedProblemData={fetchedProblemData}
            onRemoveTag={handleRemoveTag}
            onOpenTagModal={openTagModal}
          />
          <ChildProblemSection
            control={control}
            register={register}
            watch={watch}
            childProblems={childProblems}
            tagsNameMap={tagsNameMap}
            onAddChildProblem={handleAddChildProblem}
            onDeleteChildProblem={handleDeleteChildProblem}
            onRemoveChildTag={handleRemoveChildTag}
            onOpenChildTagModal={(index, concepts) => {
              setCurrentChildIndex(index);
              setCurrentChildTagList(concepts);
              openChildTagModal();
            }}
            onAddPointing={handleAddPointing}
            onDeletePointing={handleDeletePointing}
            onOpenPointingTagModal={(childIndex, pointingIndex, concepts) => {
              setCurrentPointingIndex({ childIndex, pointingIndex });
              setCurrentPointingTagList(concepts);
              openPointingTagModal();
            }}
          />
          <TipSection />
        </div>
        <FloatingButton>저장하기</FloatingButton>
      </form>
      <Modal isOpen={isTagModalOpen} onClose={closeTagModal}>
        <TagSelectModal
          onClose={closeTagModal}
          selectedTagList={concepts || []}
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
      <Modal isOpen={isPointingTagModalOpen} onClose={closePointingTagModal}>
        <TagSelectModal
          onClose={closePointingTagModal}
          selectedTagList={currentPointingTagList}
          handleChangeTagList={(tagList) =>
            handleChangePointingTagList(tagList, currentPointingIndex)
          }
        />
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text='문제을 삭제할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={handleMutateDelete}
        />
      </Modal>
      <Modal isOpen={isCreatePracticeTestModalOpen} onClose={closeCreatePracticeTestModal}>
        <CreatePracticeTestModal onClose={closeCreatePracticeTestModal} />
      </Modal>
    </>
  );
}
