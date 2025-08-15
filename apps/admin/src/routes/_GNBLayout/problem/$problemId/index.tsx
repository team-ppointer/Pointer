import { FloatingButton, Header, Modal, TagSelectModal, TwoButtonModalTemplate } from '@components';
import { components } from '@schema';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
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
    trigger,
    clearErrors,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: transformToProblemUpdateRequest({} as ProblemInfoResp),
  });

  const problemType = watch('problemType');
  const concepts = watch('concepts');
  const selectedAnswerType = watch('answerType');

  const {
    fields: childProblems,
    append,
    remove,
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
      // answer 필드를 숫자로 변환 (메인 문제)
      answer: typeof data.answer === 'string' ? parseInt(data.answer, 10) : data.answer,
      // 이미지 ID가 undefined인 경우 명시적으로 undefined로 설정 (삭제 의미)
      mainAnalysisImageId: data.mainAnalysisImageId ?? undefined,
      mainHandAnalysisImageId: data.mainHandAnalysisImageId ?? undefined,
      childProblems: data.childProblems?.map((child) => ({
        ...child,
        id: child.id && typeof child.id === 'string' ? undefined : child.id, // 새로 생성되는 경우 undefined로 명시
        answer: typeof child.answer === 'string' ? parseInt(child.answer, 10) : child.answer, // answer 필드를 숫자로 변환
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
          toast.error((error as { message?: string })?.message || '저장에 실패했습니다');
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
    // setValue를 사용해서 concepts 필드만 업데이트 (id 보존)
    setValue(`childProblems.${index}.concepts`, [...tagList]);
  };

  const handleRemoveChildTag = (tagId: number, index: number) => {
    // 현재 concepts를 가져와서 필터링 후 setValue로 업데이트 (id 보존)
    const currentConcepts = watch(`childProblems.${index}.concepts`) || [];
    const newConcepts = currentConcepts.filter((tag: number) => tag !== tagId);
    setValue(`childProblems.${index}.concepts`, newConcepts);
  };

  const handleAddPointing = (childProblemIndex: number) => {
    // 현재 pointings 배열을 가져와서 새로운 pointing 추가 (id 보존)
    const currentPointings = watch(`childProblems.${childProblemIndex}.pointings`) || [];
    const newPointing: components['schemas']['PointingUpdateRequest'] = {
      id: undefined, // 새로 생성되는 경우 undefined
      no: currentPointings.length + 1,
      questionContent: { blocks: [] },
      commentContent: { blocks: [] },
      concepts: [],
    };
    setValue(`childProblems.${childProblemIndex}.pointings`, [...currentPointings, newPointing]);
  };

  const handleDeletePointing = (childProblemIndex: number, pointingIndex: number) => {
    // 현재 pointings 배열을 가져와서 특정 인덱스 삭제 후 번호 재정렬 (id 보존)
    const currentPointings = watch(`childProblems.${childProblemIndex}.pointings`) || [];
    const updatedPointings = currentPointings
      .filter((_: unknown, index: number) => index !== pointingIndex)
      .map((pointing: components['schemas']['PointingUpdateRequest'], index: number) => ({
        ...pointing,
        no: index + 1, // 번호 재정렬
      }));
    setValue(`childProblems.${childProblemIndex}.pointings`, updatedPointings);
  };

  const handleChangePointingTagList = (
    tagList: number[],
    pointingIndex: { childIndex: number; pointingIndex: number } | undefined
  ) => {
    if (!pointingIndex) return;
    const { childIndex, pointingIndex: pIndex } = pointingIndex;
    // setValue를 사용해서 pointing의 concepts 필드만 업데이트 (id 보존)
    setValue(`childProblems.${childIndex}.pointings.${pIndex}.concepts`, [...tagList]);
  };

  // useEffect
  useEffect(() => {
    if (fetchedProblemData) {
      reset(transformToProblemUpdateRequest(fetchedProblemData));
      // API에서 불러온 기본값으로 폼을 초기화한 뒤 유효성 검사를 트리거하여 저장 버튼 활성화 상태 반영
      trigger();
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
        <Header title='문제 수정' deleteButton='문제 삭제' onClickDelete={openDeleteModal} />
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

          <ProblemEssentialInput.ProblemID
            {...register('customId', {
              required: '문제 ID는 필수 입력 항목입니다.',
            })}
          />
        </ProblemEssentialInput>
        <div className='mt-1200 flex flex-col gap-1200'>
          <MainProblemSection
            control={control}
            register={register}
            errors={errors}
            setValue={setValue}
            concepts={concepts}
            selectedAnswerType={selectedAnswerType}
            tagsNameMap={tagsNameMap}
            fetchedProblemData={fetchedProblemData}
            onRemoveTag={handleRemoveTag}
            onOpenTagModal={openTagModal}
          />
          <ChildProblemSection
            control={control}
            register={register}
            watch={watch}
            setValue={setValue}
            childProblems={childProblems}
            tagsNameMap={tagsNameMap}
            fetchedProblemData={fetchedProblemData}
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
          <TipSection setValue={setValue} fetchedProblemData={fetchedProblemData} />
        </div>
        <FloatingButton disabled={!isValid}>저장하기</FloatingButton>
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
