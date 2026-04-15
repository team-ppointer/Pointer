import { postProblemSet } from '@apis';
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
import { useState } from 'react';
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
import { Save, Plus, CheckCircle2, Circle, Package, Files } from 'lucide-react';

export const Route = createFileRoute('/_GNBLayout/problem-set/register/')({
  component: RouteComponent,
});

type ProblemSetItemResp = components['schemas']['ProblemSetItemResp'];
type ProblemMetaResp = components['schemas']['ProblemMetaResp'];
type ProblemSetCreateForm = {
  title: string;
  status: 'CONFIRMED' | 'DOING';
};

const createEmptyProblemSummary = (no: number): ProblemSetItemResp => ({
  id: 0,
  no,
  problem: {
    id: 0,
    customId: '',
    problemType: 'MAIN_PROBLEM',
    createType: 'CREATION_PROBLEM',
    practiceTest: { id: 0, year: 0, month: 0, grade: 0, name: '', displayName: '' },
    practiceTestNo: 0,
    problemContent: '',
    title: '',
    answerType: 'MULTIPLE_CHOICE',
    answer: 0,
    difficulty: 0,
    recommendedTimeSec: 0,
    memo: '',
    concepts: [],
  },
});

function RouteComponent() {
  const { navigate } = useRouter();
  const { invalidateProblemSet } = useInvalidate();

  const [problemSummaries, setProblemSummaries] = useState<ProblemSetItemResp[]>([
    createEmptyProblemSummary(1),
  ]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState<number>(0);
  const [deleteProblemIndex, setDeleteProblemIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [confirmStatus, setConfirmStatus] = useState<'CONFIRMED' | 'DOING'>('DOING');

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
  const { mutate: mutatePostProblemSet } = postProblemSet();

  const { register, handleSubmit, setValue } = useForm<ProblemSetCreateForm>({
    defaultValues: {
      title: '',
      status: 'DOING',
    },
  });

  const openError = (message: string) => {
    setErrorMessage(message);
    openErrorModal();
  };

  const handleChangeStatus = (nextStatus: 'CONFIRMED' | 'DOING') => {
    if (nextStatus === confirmStatus) {
      return;
    }
    setConfirmStatus(nextStatus);
    setValue('status', nextStatus);
  };

  const handleClickAdd = () => {
    const emptySlotIndex = problemSummaries.findIndex((item) => item.problem.id === 0);
    if (emptySlotIndex !== -1) {
      setCurrentProblemIndex(emptySlotIndex);
      openSearchModal();
      return;
    }

    const nextIndex = problemSummaries.length;
    setProblemSummaries((prev) => [...prev, createEmptyProblemSummary(prev.length + 1)]);
    setCurrentProblemIndex(nextIndex);
    openSearchModal();
  };

  // const handleAddProblem = (index: number) => {
  //   setCurrentProblemIndex(index);
  //   openSearchModal();
  // };

  const handleClickDeleteProblem = (index: number) => {
    setDeleteProblemIndex(index);
    openProblemDeleteModal();
  };

  const handleDeleteProblem = (index: number) => {
    if (problemSummaries.length === 1) {
      setProblemSummaries([createEmptyProblemSummary(1)]);
      closeProblemDeleteModal();
      return;
    }

    const newProblemSummaries = problemSummaries.filter((_, itemIndex) => itemIndex !== index);
    setProblemSummaries(
      newProblemSummaries.map((item, itemIndex) => ({
        ...item,
        no: itemIndex + 1,
      }))
    );

    closeProblemDeleteModal();
  };

  const handleAddProblemSummary = (index: number, problemMeta: ProblemMetaResp) => {
    if (problemSummaries.map((item) => item.problem.id).includes(problemMeta.id)) {
      openError('이미 추가된 문제이에요');
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
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const currentSequence = problemSummaries.findIndex((item) => item.problem.id === active.id);
    const newSequence = problemSummaries.findIndex((item) => item.problem.id === over.id);

    setProblemSummaries((prevList) => {
      const reordered = arrayMove(prevList, currentSequence, newSequence);
      return reordered.map((item, index) => ({
        ...item,
        no: index + 1,
      }));
    });
  };

  const handleClickSave = async (data: ProblemSetCreateForm) => {
    if (!data.title.trim()) {
      openError('세트 제목을 입력해주세요');
      return;
    }

    const validProblems = problemSummaries.filter((item) => item.problem.id !== 0);
    if (validProblems.length === 0) {
      openError('적어도 1개의 문제을 등록해주세요');
      return;
    }

    try {
      await new Promise<void>((resolve, reject) => {
        mutatePostProblemSet(
          {
            body: {
              title: data.title.trim(),
              status: data.status,
              problems: validProblems.map((item, index) => ({
                no: index + 1,
                problemId: item.problem.id,
              })),
            } as components['schemas']['ProblemSetCreateRequest'],
          },
          {
            onSuccess: () => resolve(),
            onError: (error) => reject(error),
          }
        );
      });

      await invalidateProblemSet(0);
      toast.success('저장이 완료되었습니다');
      navigate({ to: '/problem-set' });
    } catch (error) {
      if (error instanceof Error) {
        openError(error.message);
        return;
      }
      openError('저장 중 오류가 발생했습니다.');
    }
  };

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

      <Header title='세트 등록'>
        <div className='flex items-center gap-3'>
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
                    onChange: () => {
                      /* no-op for RHF sync */
                    },
                  })}
                />
              </div>

              <SegmentedControl
                value={confirmStatus}
                onChange={(value) => handleChangeStatus(value as 'CONFIRMED' | 'DOING')}
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
                      <div key={`empty-${index}`} className='text-gray-500'>
                        등록된 문제가 없습니다. 문제를 추가해주세요.
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
