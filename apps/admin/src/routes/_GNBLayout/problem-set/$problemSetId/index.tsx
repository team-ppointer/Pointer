import {
  deleteProblemSet,
  getProblemSetById,
  putProblemSetToggleStatus,
  putProblemSet,
  deleteProblemFromProblemSet,
} from '@apis';
import {
  Button,
  ComponentWithLabel,
  ErrorModalTemplate,
  Header,
  IconButton,
  Input,
  Modal,
  PlusButton,
  ProblemCard,
  ProblemSearchModal,
  Tag,
  TwoButtonModalTemplate,
} from '@components';
import { useInvalidate, useModal } from '@hooks';
import { components } from '@schema';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Slide, toast, ToastContainer } from 'react-toastify';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';

import { StatusToggle } from '@/components/problemSet';

export const Route = createFileRoute('/_GNBLayout/problem-set/$problemSetId/')({
  component: RouteComponent,
});

type ProblemSetUpdateRequest = components['schemas']['ProblemSetUpdateRequest'];
type ProblemMetaResp = components['schemas']['ProblemMetaResp'];
type ProblemSetItemResp = components['schemas']['ProblemSetItemResp'];

function RouteComponent() {
  const { problemSetId } = Route.useParams();
  const { navigate } = useRouter();
  const { invalidateProblemSet } = useInvalidate();

  const [problemSummaries, setProblemSummaries] = useState<ProblemSetItemResp[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState<number>(0);
  const [deleteProblemIndex, setDeleteProblemIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [confirmStatus, setConfirmStatus] = useState<'CONFIRMED' | 'DOING'>('DOING');
  const [originalProblems, setOriginalProblems] = useState<ProblemSetItemResp[]>([]);

  const {
    isOpen: isSetDeleteModalOpen,
    openModal: openSetDeleteModal,
    closeModal: closeSetDeleteModal,
  } = useModal();

  const {
    isOpen: isProblemDeleteModalOpen,
    openModal: openProblemDeleteModal,
    closeModal: closeProblemDeleteModal,
  } = useModal();

  const {
    isOpen: isSearchModalOpen,
    openModal: openSearchModal,
    closeModal: closeSearchModal,
  } = useModal();

  const {
    isOpen: isErrorModalOpen,
    openModal: openErrorModal,
    closeModal: closeErrorModal,
  } = useModal();

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  // api
  const { data: problemSetData } = getProblemSetById({ id: Number(problemSetId) });
  const { mutate: mutatePutProblemSet } = putProblemSet();
  const { mutate: mutateConfirmProblemSet } = putProblemSetToggleStatus();
  const { mutate: mutateDeleteProblemSet } = deleteProblemSet();
  const { mutate: mutateDeleteProblemFromProblemSet } = deleteProblemFromProblemSet();

  // RHF
  const { register, handleSubmit, setValue } = useForm<{
    title: string;
    status: 'CONFIRMED' | 'DOING';
  }>({
    defaultValues: {
      title: '',
      status: 'DOING',
    },
  });

  const handleClickConfirm = () => {
    if (!isSaved) {
      setErrorMessage(`저장되지 않은 내용이 있어요\n저장 후 다시 시도해주세요`);
      openErrorModal();
      return;
    }

    mutateConfirmProblemSet(
      {
        params: {
          path: {
            id: Number(problemSetId),
          },
        },
      },
      {
        onSuccess: async (data) => {
          await invalidateProblemSet(Number(problemSetId));
          setConfirmStatus(data.status);
          if (data.status === 'CONFIRMED') {
            toast.success('컨펌이 완료되었습니다');
          } else {
            toast.info('컨펌이 취소되었습니다');
          }
        },
        onError: (error: Error) => {
          setErrorMessage(error.message || '오류가 발생했습니다.');
          openErrorModal();
        },
      }
    );
  };

  const handleMutateSetDelete = () => {
    mutateDeleteProblemSet(
      {
        params: {
          path: {
            id: Number(problemSetId),
          },
        },
      },
      {
        onSuccess: async () => {
          await invalidateProblemSet(Number(problemSetId));
          navigate({ to: '/problem-set' });
        },
      }
    );
  };

  // functions
  const handleClickSetDelete = () => {
    // publishedDates 속성이 스키마에 없으므로 주석 처리
    // if (problemSetData?.publishedDates && problemSetData?.publishedDates.length > 0) {
    //   setErrorMessage('발행된 세트는 삭제할 수 없어요');
    //   openErrorModal();
    //   return;
    // }
    openSetDeleteModal();
  };

  const createModifyError = () => {
    setErrorMessage('컨펌된 세트는 문항을 수정할 수 없어요');
    openErrorModal();
  };

  const handleClickAdd = () => {
    if (confirmStatus === 'CONFIRMED') {
      createModifyError();
      return;
    }

    setProblemSummaries((prev) => {
      return [
        ...prev,
        {
          id: 0,
          no: prev.length + 1,
          problem: {
            id: 0,
            customId: '',
            problemType: 'CREATION_PROBLEM',
            practiceTest: { id: 0, year: 0, month: 0, grade: 0, name: '', displayName: '' },
            practiceTestNo: 0,
            problemContent: { id: 0, blocks: [] },
            title: '',
            answerType: 'MULTIPLE_CHOICE',
            answer: 0,
            difficulty: 0,
            recommendedTimeSec: 0,
            memo: '',
            concepts: [],
          },
        },
      ];
    });
  };

  const handleAddProblem = (index: number) => {
    setCurrentProblemIndex(index);
    openSearchModal();
  };

  const handleClickDeleteProblem = (index: number) => {
    if (confirmStatus === 'CONFIRMED') {
      createModifyError();
      return;
    }

    setDeleteProblemIndex(index);
    openProblemDeleteModal();
  };

  const handleDeleteProblem = (index: number) => {
    if (isSaved) setIsSaved(false);

    if (problemSummaries.length === 1) {
      resetProblemSummaries();
      setOriginalProblems([]);
      closeProblemDeleteModal();
      return;
    }

    const newProblemSummaries = [...problemSummaries];
    newProblemSummaries.splice(index, 1);
    setProblemSummaries(newProblemSummaries);

    closeProblemDeleteModal();
  };

  const resetProblemSummaries = () => {
    setProblemSummaries([
      {
        id: 0,
        no: 1,
        problem: {
          id: 0,
          customId: '',
          problemType: 'CREATION_PROBLEM',
          practiceTest: { id: 0, year: 0, month: 0, grade: 0, name: '', displayName: '' },
          practiceTestNo: 0,
          problemContent: { id: 0, blocks: [] },
          title: '',
          answerType: 'MULTIPLE_CHOICE',
          answer: 0,
          difficulty: 0,
          recommendedTimeSec: 0,
          memo: '',
          concepts: [],
        },
      },
    ]);
  };

  const handleAddProblemSummary = (index: number, problemMeta: ProblemMetaResp) => {
    if (problemSummaries.map((item) => item.problem.id).includes(problemMeta.id)) {
      setErrorMessage('이미 추가된 문항이에요');
      openErrorModal();
      return;
    }

    const newProblemSummaries = [...problemSummaries];
    newProblemSummaries[index] = {
      id: problemMeta.id,
      no: index + 1,
      problem: problemMeta,
    };
    setProblemSummaries(newProblemSummaries);

    closeSearchModal();
    if (isSaved) setIsSaved(false);
  };

  const handleClickSave = async (data: ProblemSetUpdateRequest) => {
    if (problemSummaries.length === 0) {
      setErrorMessage('적어도 1개의 문항을 등록해주세요');
      openErrorModal();
      return;
    }

    try {
      // originalProblems: 원본 선택 문제들
      // problemSummaries: 현재 선택된 문제들
      // 삭제할 문제들 찾기 (원본에는 있지만 현재에는 없는 것들)
      const problemsToDelete = originalProblems.filter(
        (item) => !problemSummaries.map((item) => item.problem.id).includes(item.problem.id)
      );
      // 선택된 문제들 업데이트
      await new Promise<void>((resolve, reject) => {
        console.log('originalProblems: ');
        console.log(originalProblems);
        console.log('problemSummaries: ');
        console.log(problemSummaries);
        mutatePutProblemSet(
          {
            body: {
              title: data.title,
              status: data.status,
              problems: problemSummaries.map((item, index) => ({
                no: index + 1,
                problemId: item.problem.id,
              })),
            },
            params: {
              path: {
                id: Number(problemSetId),
              },
            },
          },
          {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          }
        );
      });
      // 삭제할 문제들 제거
      // console.log('problemsToDelete: ');
      // console.log(problemsToDelete);
      // for (const problemToDelete of problemsToDelete) {
      //   await new Promise<void>((resolve, reject) => {
      //     mutateDeleteProblemFromProblemSet(
      //       {
      //         params: {
      //           path: {
      //             id: Number(problemSetId),
      //             problemId: problemToDelete.id,
      //           },
      //         },
      //       },
      //       {
      //         onSuccess: () => resolve(),
      //         onError: (error) => reject(error),
      //       }
      //     );
      //   });
      // }
      // 6. 성공 처리
      await invalidateProblemSet(Number(problemSetId));
      toast.success('저장이 완료되었습니다');
      setIsSaved(true);
      setOriginalProblems([...problemSummaries]);
    } catch {
      setErrorMessage('저장 중 오류가 발생했습니다.');
      openErrorModal();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const currentSequence = problemSummaries.findIndex((item) => item.problem.id === active.id);
      const newSequence = problemSummaries.findIndex((item) => item.problem.id === over.id);

      setProblemSummaries((prevList) => arrayMove(prevList, currentSequence, newSequence));
      if (isSaved) setIsSaved(false);
    }
  };

  // useEffect
  useEffect(() => {
    if (problemSetData) {
      setValue('title', problemSetData.title ?? '');
      setValue('status', problemSetData.status ?? 'DOING');
      setConfirmStatus(problemSetData.status ?? 'DOING');
      if (problemSetData.problems.length === 0) {
        resetProblemSummaries();
        setOriginalProblems([]);
      } else {
        setProblemSummaries(problemSetData.problems);
        setOriginalProblems([...problemSetData.problems]); // 원본 데이터 저장
      }
    }
  }, [problemSetData]);

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
      <Header
        title='세트 수정하기'
        description={`문항을 잡고 드래그해서 순서를 바꿀 수 있어요\n컨펌된 세트도 타이틀 수정이 가능해요`}
        deleteButton='세트 삭제'
        onClickDelete={handleClickSetDelete}
      />
      <div className='mt-[6.4rem] flex justify-between'>
        <div className='w-[81.5rem]'>
          <ComponentWithLabel label='세트 제목'>
            <Input
              placeholder='입력해주세요'
              {...register('title', {
                onChange: () => isSaved && setIsSaved(false),
              })}
            />
          </ComponentWithLabel>
        </div>

        <div className='flex items-center gap-[2.4rem]'>
          <StatusToggle
            selectedStatus={confirmStatus}
            onSelect={(status) => {
              if (status !== confirmStatus) {
                handleClickConfirm();
              }
            }}
          />
          <div className='flex items-center gap-[0.8rem]'>
            <Button variant='light'>미리보기</Button>
            <Button variant='dark' onClick={handleSubmit(handleClickSave)}>
              저장하기
            </Button>
          </div>
        </div>
      </div>
      <div className='mt-[4.8rem] grid w-full auto-cols-[48rem] grid-flow-col gap-[3.2rem] overflow-auto'>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={problemSummaries.map((item) => item.problem.id)}
            strategy={horizontalListSortingStrategy}>
            {problemSummaries.map((item: ProblemSetItemResp, index: number) => {
              const handlePointerDown = (event: React.PointerEvent) => {
                event.stopPropagation(); // 이벤트가 상위로 전파되지 않도록 차단
              };
              const problem = item.problem;
              const getImageUrl = () => {
                const imageBlock = problem.problemContent?.blocks?.find(
                  (block) => block.type === 'IMAGE'
                );
                return imageBlock?.data;
              };

              return (
                <ProblemCard key={`${problem.id}-${index}`} problemId={problem.id}>
                  {problem.id === 0 ? (
                    <ProblemCard.EmptyView onClick={() => handleAddProblem(index)} />
                  ) : (
                    <>
                      <ProblemCard.TextSection>
                        <ProblemCard.Title title={`문항 ${index + 1}`} />
                        <ProblemCard.Info label='문항 ID' content={problem.customId} />
                        <ProblemCard.Info label='문항 타이틀' content={problem.title} />
                        <ProblemCard.Info label='문항 메모' content={problem.memo} />
                        <ProblemCard.TagSection>
                          {problem.concepts?.map((concept, tagIndex) => {
                            return <Tag key={`${concept.name}-${tagIndex}`} label={concept.name} />;
                          })}
                        </ProblemCard.TagSection>
                      </ProblemCard.TextSection>
                      <ProblemCard.ButtonSection>
                        <IconButton
                          variant='modify'
                          onClick={() =>
                            navigate({
                              to: '/problem/$problemId',
                              params: { problemId: problem.id.toString() },
                            })
                          }
                          onPointerDown={handlePointerDown}
                        />
                        <IconButton
                          variant='delete'
                          onClick={() => handleClickDeleteProblem(index)}
                          onPointerDown={handlePointerDown}
                        />
                      </ProblemCard.ButtonSection>
                      <ProblemCard.CardImage src={getImageUrl()} height={'34.4rem'} />
                    </>
                  )}
                </ProblemCard>
              );
            })}
          </SortableContext>
        </DndContext>
        <div className='flex items-center'>
          <PlusButton onClick={handleClickAdd} />
        </div>
      </div>
      <Modal isOpen={isSetDeleteModalOpen} onClose={closeSetDeleteModal}>
        <TwoButtonModalTemplate
          text='세트를 삭제할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeSetDeleteModal}
          handleClickRightButton={handleMutateSetDelete}
        />
      </Modal>
      <Modal isOpen={isProblemDeleteModalOpen} onClose={closeProblemDeleteModal}>
        <TwoButtonModalTemplate
          text='문항을 세트에서 제외할까요??'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeProblemDeleteModal}
          handleClickRightButton={() => handleDeleteProblem(deleteProblemIndex)}
        />
      </Modal>
      <Modal isOpen={isSearchModalOpen} onClose={closeSearchModal}>
        <ProblemSearchModal
          onClickCard={(problem: ProblemMetaResp) => {
            handleAddProblemSummary(currentProblemIndex, problem);
          }}
        />
      </Modal>
      <Modal isOpen={isErrorModalOpen} onClose={closeErrorModal}>
        <ErrorModalTemplate
          text={errorMessage}
          buttonText='닫기'
          handleClickButton={closeErrorModal}
        />
      </Modal>
    </>
  );
}
