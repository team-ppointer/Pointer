import { postProblem, getCustomId, getConcept } from '@apis';
import { Button, FloatingButton, Header, Modal, TagSelectModal } from '@components';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { components } from '@schema';
import { useInvalidate, useModal } from '@hooks';
import { transformToProblemUpdateRequest } from '@utils';
import { Slide, toast, ToastContainer } from 'react-toastify';
import { useState } from 'react';

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

  const handleClickComplete = () => {
    setShowDetailSections(true);
  };

  const handleClickSave = (data: ProblemPostRequest) => {
    const completeData: ProblemPostRequest = {
      ...data,
      // answer 필드를 숫자로 변환 (메인 문제)
      answer: typeof data.answer === 'string' ? parseInt(data.answer, 10) : data.answer,
      // childProblems의 answer 필드도 숫자로 변환
      childProblems: data.childProblems?.map((child) => ({
        ...child,
        answer: typeof child.answer === 'string' ? parseInt(child.answer, 10) : child.answer,
      })),
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
        <Header title='문제 등록' />
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
          <ProblemEssentialInput.ProblemID
            {...register('customId', {
              required: '문제 ID는 필수 입력 항목입니다.',
            })}
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
                setValue={setValue}
                concepts={concepts}
                selectedAnswerType={selectedAnswerType}
                tagsNameMap={tagsNameMap}
                fetchedProblemData={undefined}
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
              <TipSection setValue={setValue} />
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
