import { postProblem, getCustomId, getConcept } from '@apis';
import { Button, FloatingButton, Header, Modal, TagSelectModal } from '@components';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { components } from '@schema';
import { useInvalidate, useModal } from '@hooks';
import { transformToProblemUpdateRequest } from '@utils';
import { Slide, toast, ToastContainer } from 'react-toastify';
import { useState } from 'react';
import { produce } from 'immer';

import CreatePracticeTestModal from '@/components/common/Modals/CreatePracticeTestModal';
import {
  ProblemEssentialInput,
  MainProblemSection,
  ChildProblemSection,
  TipSection,
} from '@/components/problem';

export const Route = createFileRoute('/_GNBLayout/problem/register/')({
  component: RouteComponent,
});

type ProblemPostRequest = components['schemas']['ProblemCreateRequest'];
type ProblemInfoResp = components['schemas']['ProblemInfoResp'];

function RouteComponent() {
  const { navigate } = useRouter();
  const { invalidateAll } = useInvalidate();
  const [showDetailSections, setShowDetailSections] = useState(false);
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

  const { mutate } = postProblem();
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
    reset: _reset,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: transformToProblemUpdateRequest({} as ProblemInfoResp),
  });
  const { data: customIdData } = getCustomId();
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

  const handleClickComplete = () => {
    setShowDetailSections(true);
  };

  const handleClickSave = (data: ProblemPostRequest) => {
    const customId = customIdData?.customId || 'temp-id';

    const completeData: ProblemPostRequest = {
      ...data,
      customId: customId,
    };

    console.log('저장할 데이터:', completeData);

    mutate(
      {
        body: completeData,
      },
      {
        onSuccess: () => {
          invalidateAll();
          toast.success('생성이 완료되었습니다');
          navigate({ to: '/problem' });
        },
        onError: (error: unknown) => {
          console.error('생성 실패 상세:', error);
          toast.error('생성에 실패했습니다');
        },
      }
    );
  };

  const handleAddChildProblem = () => {
    append({
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
      <form onSubmit={handleSubmit(handleClickSave)}>
        {showDetailSections ? (
          <Header title={`문제 ID : ${customIdData?.customId}`} />
        ) : (
          <Header title='문항 등록' />
        )}
        <ProblemEssentialInput>
          <Controller
            control={control}
            name='problemType'
            render={({ field }) => (
              <ProblemEssentialInput.ProblemTypeSection
                problemType={field.value}
                handleChangeType={(type) => {
                  if (type === 'CREATION_PROBLEM') {
                    setValue('practiceTestId', undefined);
                    setValue('practiceTestNo', undefined);
                  }
                  clearErrors();
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
                  required: '모의고사와 문항 번호는 필수 입력 항목입니다.',
                })}
              />
            </ProblemEssentialInput.PracticeTestSection>
          )}
          <ProblemEssentialInput.ProblemError
            isError={Boolean(errors.practiceTestId || errors.practiceTestNo)}
            errorMessage='모의고사와 문항 번호는 필수 입력 항목입니다.'
          />
        </ProblemEssentialInput>

        {!showDetailSections && (
          <div className='mt-[2.4rem] flex w-full items-center justify-end'>
            <Button
              type='button'
              sizeType='long'
              variant='dark'
              onClick={handleSubmit(handleClickComplete)}>
              완료
            </Button>
          </div>
        )}

        {showDetailSections && (
          <>
            <div className='mt-[4.8rem] flex flex-col gap-[4.8rem]'>
              <MainProblemSection
                control={control}
                register={register}
                errors={errors}
                concepts={concepts}
                selectedAnswerType={selectedAnswerType}
                selectedAnswer={selectedAnswer}
                tagsNameMap={tagsNameMap}
                fetchedProblemData={undefined}
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
            <FloatingButton type='submit'>저장하기</FloatingButton>
          </>
        )}
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
      <Modal isOpen={isCreatePracticeTestModalOpen} onClose={closeCreatePracticeTestModal}>
        <CreatePracticeTestModal onClose={closeCreatePracticeTestModal} />
      </Modal>
    </>
  );
}
