import { deleteProblemSet, getProblemSetSearch } from '@apis';
import { Header, Input, Modal, ProblemPreview, TwoButtonModalTemplate } from '@components';
import { useInvalidate, useModal } from '@hooks';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { GetProblemSetSearchParams } from '@types';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Search,
  Plus,
  Trash2,
  ChevronRight,
  RotateCcw,
  Package,
  FileText,
  ChevronDown,
  ChevronUp,
  Pencil,
} from 'lucide-react';

export const Route = createFileRoute('/_GNBLayout/problem-set/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { invalidateProblemSet } = useInvalidate();
  const { navigate } = useRouter();

  const [searchQuery, setSearchQuery] = useState<GetProblemSetSearchParams>({});
  const [expandedSets, setExpandedSets] = useState<Set<number>>(new Set());
  const { register, handleSubmit, reset, watch } = useForm<GetProblemSetSearchParams>();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const deleteProblemSetId = useRef<number | null>(null);

  const toggleSetExpanded = (setId: number) => {
    setExpandedSets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(setId)) {
        newSet.delete(setId);
      } else {
        newSet.add(setId);
      }
      return newSet;
    });
  };

  const { data: problemSetList } = getProblemSetSearch(searchQuery);
  const { mutate: mutateDeleteProblemSet } = deleteProblemSet();

  const watchedSetTitle = watch('setTitle');
  const watchedProblemTitle = watch('problemTitle');
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const trimmedSetTitle = (watchedSetTitle ?? '').toString().trim();
      const trimmedProblemTitle = (watchedProblemTitle ?? '').toString().trim();

      setSearchQuery((prev) => {
        const nextQuery: GetProblemSetSearchParams = {
          ...prev,
          setTitle: trimmedSetTitle || undefined,
          problemTitle: trimmedProblemTitle || undefined,
        };

        const cleaned = Object.fromEntries(
          Object.entries(nextQuery).filter(([, value]) =>
            Array.isArray(value) ? value.length > 0 : Boolean(value)
          )
        ) as GetProblemSetSearchParams;

        return cleaned;
      });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [watchedSetTitle, watchedProblemTitle]);

  const handleClickSearch = (data: GetProblemSetSearchParams) => {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => Boolean(value))
    );

    setSearchQuery({ ...filteredData });
  };

  const handleResetQuery = () => {
    reset();
    setSearchQuery({});
  };

  const handleClickDelete = (problemSetId: number) => {
    deleteProblemSetId.current = problemSetId;
    openDeleteModal();
  };

  const handleMutateDelete = () => {
    if (!deleteProblemSetId.current) return;

    mutateDeleteProblemSet(
      {
        params: {
          path: {
            id: deleteProblemSetId.current,
          },
        },
      },
      {
        onSuccess: async () => {
          await invalidateProblemSet(deleteProblemSetId.current ?? 0);
          closeDeleteModal();
        },
      }
    );
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <Header title='세트'>
        <Header.Button
          Icon={Plus}
          color='main'
          onClick={() => navigate({ to: '/problem-set/register' })}>
          세트 등록
        </Header.Button>
      </Header>

      <div className='mx-auto max-w-7xl px-8 py-8'>
        {/* Search Card */}
        <div className='mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white'>
          <div className='px-6 pt-6'>
            <h2 className='flex items-center gap-3 text-xl font-bold text-gray-900'>
              <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                <Search className='h-5 w-5 text-white' />
              </div>
              세트 검색
            </h2>
          </div>

          <form onSubmit={handleSubmit(handleClickSearch)} className='space-y-6 p-8'>
            <div className='flex items-end gap-4'>
              <div className='flex-1'>
                <label className='mb-2 block text-sm font-semibold text-gray-700'>세트 제목</label>
                <Input
                  placeholder='세트 제목을 입력해주세요'
                  {...register('setTitle', { required: false })}
                />
              </div>
              <div className='flex-1'>
                <label className='mb-2 block text-sm font-semibold text-gray-700'>문제 제목</label>
                <Input
                  placeholder='문제 제목을 입력해주세요'
                  {...register('problemTitle', { required: false })}
                />
              </div>
              <button
                type='button'
                onClick={handleResetQuery}
                className='flex h-[45.8px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                <RotateCcw className='h-4 w-4' />
                초기화
              </button>
            </div>
          </form>
        </div>

        {/* Problem Sets */}
        <div className='space-y-4'>
          {problemSetList?.data.map((problemSet) => {
            const isExpanded = expandedSets.has(problemSet.id);
            const problemCount = problemSet.problems.length;

            return (
              <div
                key={problemSet.id}
                className='overflow-hidden rounded-2xl border border-gray-200 bg-white'>
                {/* Set Header */}
                <div
                  className='cursor-pointer border-b border-gray-100 px-6 py-5 transition-all duration-200 hover:bg-gray-50'
                  onClick={(e) => {
                    e.preventDefault();
                    toggleSetExpanded(problemSet.id);
                  }}>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                        <Package className='h-5 w-5 text-white' />
                      </div>
                      <div>
                        <h3 className='text-lg font-bold text-gray-900'>{problemSet.title}</h3>
                        <p className='text-sm text-gray-500'>문제 {problemCount}개</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <button
                        type='button'
                        onClick={(e) => {
                          e.preventDefault();
                          handleClickDelete(problemSet.id);
                        }}
                        className='flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition-all duration-200 hover:border-red-200 hover:bg-red-100'>
                        <Trash2 className='h-4 w-4' />
                      </button>
                      <Link
                        to={'/problem-set/$problemSetId'}
                        params={{
                          problemSetId: problemSet.id?.toString(),
                        }}
                        className='flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                        <Pencil className='h-4 w-4' />
                      </Link>
                      <button
                        type='button'
                        className='flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                        {isExpanded ? (
                          <>
                            <ChevronUp className='h-4 w-4' />
                          </>
                        ) : (
                          <>
                            <ChevronDown className='h-4 w-4' />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Problems Grid */}
                {isExpanded && (
                  <div className='p-6'>
                    {problemCount === 0 ? (
                      <div className='flex flex-col items-center justify-center py-12 text-center'>
                        <FileText className='mb-2 h-12 w-12 text-gray-300' />
                        <p className='text-sm text-gray-500'>문제가 없습니다</p>
                      </div>
                    ) : (
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {problemSet.problems.map((problem, index) => (
                          <ProblemPreview
                            key={`problem-${index}`}
                            title={problem.problem.title ?? ''}
                            memo={problem.problem.memo ?? ''}
                            problemContent={problem.problem.problemContent}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text='세트를 삭제할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={handleMutateDelete}
        />
      </Modal>
    </div>
  );
}
