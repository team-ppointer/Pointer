import {
  deleteProblemSet,
  getProblemSetById,
  putProblemSetToggleStatus,
  putProblemSet,
} from '@apis';
import {
  Button,
  ErrorModalTemplate,
  Header,
  Input,
  Modal,
  ProblemCard,
  ProblemSearchModal,
  SegmentedControl,
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
import { Save, Trash2, Plus, CheckCircle2, Circle, Package, Files } from 'lucide-react';

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
            toast.success('컨펌이 취소되었습니다');
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
    setErrorMessage('컨펌된 세트는 문제을 수정할 수 없어요');
    openErrorModal();
  };

  const handleClickAdd = () => {
    if (confirmStatus === 'CONFIRMED') {
      createModifyError();
      return;
    }

    const emptySlotIndex = problemSummaries.findIndex((item) => item.problem.id === 0);
    if (emptySlotIndex !== -1) {
      setCurrentProblemIndex(emptySlotIndex);
      openSearchModal();
      return;
    }

    const nextIndex = problemSummaries.length;
    setProblemSummaries((prev) => {
      return [
        ...prev,
        {
          id: 0,
          no: prev.length + 1,
          problem: {
            id: 0,
            customId: '',
            problemType: 'MAIN_PROBLEM' as const,
            createType: 'CREATION_PROBLEM' as const,
            practiceTest: { id: 0, year: 0, month: 0, grade: 0, name: '', displayName: '' },
            practiceTestNo: 0,
            problemContent: '',
            title: '',
            answerType: 'MULTIPLE_CHOICE' as const,
            answer: 0,
            difficulty: 0,
            recommendedTimeSec: 0,
            memo: '',
            concepts: [],
          },
        },
      ];
    });
    setCurrentProblemIndex(nextIndex);
    openSearchModal();
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
          problemType: 'MAIN_PROBLEM' as const,
          createType: 'CREATION_PROBLEM' as const,
          practiceTest: { id: 0, year: 0, month: 0, grade: 0, name: '', displayName: '' },
          practiceTestNo: 0,
          problemContent: '',
          title: '',
          answerType: 'MULTIPLE_CHOICE' as const,
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
      setErrorMessage('이미 추가된 문제이에요');
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
      setErrorMessage('적어도 1개의 문제을 등록해주세요');
      openErrorModal();
      return;
    }

    try {
      // 선택된 문제들 업데이트
      await new Promise<void>((resolve, reject) => {
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

      // 성공 처리
      await invalidateProblemSet(Number(problemSetId));
      toast.success('저장이 완료되었습니다');
      setIsSaved(true);
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
      } else {
        setProblemSummaries(problemSetData.problems);
      }
    }
  }, [problemSetData]);

  return (
    <div className='min-h-screen bg-gray-50'>
      <ToastContainer
        position='top-center'
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        draggable
        pauseOnHover
        theme='light'
        transition={Slide}
      />

      {/* Header */}
      <Header title='세트 수정'>
        <div className='flex items-center gap-3'>
          <Header.Button Icon={Trash2} color='destructive' onClick={handleClickSetDelete}>
            세트 삭제
          </Header.Button>
          <Header.Button Icon={Save} color='main' onClick={handleSubmit(handleClickSave)}>
            세트 저장
          </Header.Button>
        </div>
      </Header>

      <div className='mx-auto max-w-7xl px-8 py-8'>
        <div className='mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white'>
          <div className='px-6 pt-6'>
            <h2 className='flex items-center gap-3 text-xl font-bold text-gray-900'>
              <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                <Package className='h-5 w-5 text-white' />
              </div>
              세트 정보
            </h2>
          </div>
          <div className='space-y-6 p-8'>
            <div className='flex items-end justify-between gap-4'>
              <div className='flex-1'>
                <label className='mb-2 block text-sm font-semibold text-gray-700'>세트 제목</label>
                <Input
                  placeholder='입력해주세요'
                  {...register('title', {
                    onChange: () => isSaved && setIsSaved(false),
                  })}
                />
              </div>

              <SegmentedControl
                value={confirmStatus}
                onChange={(nextStatus) => {
                  if (nextStatus === confirmStatus) {
                    return;
                  }
                  handleClickConfirm();
                }}
                items={[
                  {
                    label: '작업 중',
                    value: 'DOING',
                    icon: Circle,
                  },
                  {
                    label: '컨펌 완료',
                    value: 'CONFIRMED',
                    icon: CheckCircle2,
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Problems Section */}
        <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white'>
          <div className='flex items-center justify-between px-6 pt-6'>
            <h2 className='flex items-center gap-3 text-xl font-bold text-gray-900'>
              <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                <Files className='h-5 w-5 text-white' />
              </div>
              문제 목록
            </h2>
            <Button variant='primary' sizeType='md' onClick={handleClickAdd}>
              <Plus className='h-4 w-4' />
              문제 추가
            </Button>
          </div>

          <div className='overflow-x-auto p-8'>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}>
              <SortableContext
                items={problemSummaries.map((item) => item.problem.id)}
                strategy={horizontalListSortingStrategy}>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  {problemSummaries.map((item: ProblemSetItemResp, index: number) => {
                    const problem = item.problem;

                    return problem.id === 0 ? (
                      <div key={`empty-${index}`}>
                        <ProblemCard.EmptyView onClick={() => handleAddProblem(index)} />
                      </div>
                    ) : (
                      <div key={`${problem.id}-${index}`}>
                        <ProblemCard
                          customId={problem.customId}
                          title={problem.title}
                          memo={problem.memo}
                          problemText={problem.problemContent || ''}
                          answer={String(problem.answer)}
                          onDelete={(e) => {
                            e.stopPropagation();
                            handleClickDeleteProblem(index);
                          }}
                          onClick={() =>
                            navigate({
                              to: `/problem/$problemId`,
                              params: { problemId: problem.id.toString() },
                            })
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>

      {/* Modals */}
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
          text='문제를 세트에서 제외할까요?'
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
    </div>
  );
}
