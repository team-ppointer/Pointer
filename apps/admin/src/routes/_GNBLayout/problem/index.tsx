import { deleteProblem, getConcept, getProblemsSearch } from '@apis';
import {
  Header,
  Input,
  Modal,
  ProblemCard,
  TagSelectModal,
  TwoButtonModalTemplate,
} from '@components';
import { useInvalidate, useModal } from '@hooks';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { components } from '@schema';
import { GetProblemsSearchParams, ProblemType } from '@types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import PulseLoader from 'react-spinners/PulseLoader';
import {
  Search,
  Plus,
  List,
  Grid,
  ChevronDown,
  Trash2,
  RotateCcw,
  LayoutList,
  FileText,
  Files,
} from 'lucide-react';
import { SegmentedControl, Tag } from '@components';
import { InlineProblemViewer } from '@team-ppointer/pointer-editor-v2';

const PROBLEM_TYPE_ALL = 'ALL';

const PAGE_SIZE = 20;

const cleanSearchParams = (params: GetProblemsSearchParams): GetProblemsSearchParams => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== undefined && value !== null && value !== '';
    })
  ) as GetProblemsSearchParams;
};

const areParamsEqual = (a: GetProblemsSearchParams, b: GetProblemsSearchParams): boolean => {
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);

  for (const key of keys) {
    const prevValue = a[key as keyof GetProblemsSearchParams];
    const nextValue = b[key as keyof GetProblemsSearchParams];

    if (Array.isArray(prevValue) || Array.isArray(nextValue)) {
      const prevArray = Array.isArray(prevValue) ? prevValue : [];
      const nextArray = Array.isArray(nextValue) ? nextValue : [];

      if (prevArray.length !== nextArray.length) {
        return false;
      }

      for (let i = 0; i < prevArray.length; i += 1) {
        if (prevArray[i] !== nextArray[i]) {
          return false;
        }
      }
      continue;
    }

    if (prevValue !== nextValue) {
      return false;
    }
  }

  return true;
};

type ProblemMeta = components['schemas']['ProblemMetaResp'];

export const Route = createFileRoute('/_GNBLayout/problem/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { invalidateAll } = useInvalidate();
  const navigate = useNavigate();

  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isDeleteModalOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const deleteProblemId = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [filters, setFilters] = useState<GetProblemsSearchParams>({});
  const [selectedTagList, setSelectedTagList] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [page, setPage] = useState<number>(0);
  const [problemItems, setProblemItems] = useState<ProblemMeta[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { register, handleSubmit, reset, watch, setValue } = useForm<GetProblemsSearchParams>();

  const searchParams = useMemo<GetProblemsSearchParams>(() => {
    const { page: _page, size: _size, ...rest } = filters;
    void _page;
    void _size;

    return {
      ...rest,
      page,
      size: PAGE_SIZE,
    };
  }, [filters, page]);

  const { data: problemList, isLoading, isFetching } = getProblemsSearch(searchParams);
  const { mutate: mutateDeleteProblem } = deleteProblem();
  const { data: tagsData } = getConcept();
  const allTagList = tagsData?.data || [];
  const tagsNameMap = Object.fromEntries(allTagList.map((tag) => [tag.id, tag.name]));

  const watchedCustomId = watch('customId');
  const watchedTitle = watch('title');
  const watchedProblemType = watch('problemType');
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const trimmedCustomId = (watchedCustomId ?? '').toString().trim();
      const trimmedTitle = (watchedTitle ?? '').toString().trim();

      setFilters((prev) => {
        const nextQuery = cleanSearchParams({
          ...prev,
          customId: trimmedCustomId || undefined,
          title: trimmedTitle || undefined,
          problemType: watchedProblemType || undefined,
        });

        if (areParamsEqual(prev, nextQuery)) {
          return prev;
        }

        return nextQuery;
      });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [watchedCustomId, watchedTitle, watchedProblemType]);

  useEffect(() => {
    setProblemItems([]);
    setHasMore(true);
    setPage(0);
  }, [filters]);

  useEffect(() => {
    if (!problemList) {
      return;
    }

    const currentPage = problemList.page ?? 0;
    const lastPage = problemList.lastPage ?? 0;
    const nextItems = problemList.data ?? [];

    setHasMore(currentPage < lastPage);

    setProblemItems((prev) => {
      if (page === 0) {
        return nextItems;
      }

      const mergedMap = new Map<number, ProblemMeta>();
      prev.forEach((item) => {
        mergedMap.set(item.id, item);
      });
      nextItems.forEach((item) => {
        mergedMap.set(item.id, item);
      });

      return Array.from(mergedMap.values());
    });
  }, [problemList, page]);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node || isLoading || !hasMore) {
        return;
      }

      observerRef.current = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !isFetching) {
          setPage((prev) => {
            const basePage = problemList?.page ?? prev;
            const nextPage = basePage + 1;
            return nextPage === prev ? prev : nextPage;
          });
        }
      });

      observerRef.current.observe(node);
    },
    [hasMore, isFetching, isLoading, problemList?.page]
  );

  const isInitialLoading = (isLoading || isFetching) && problemItems.length === 0;

  const handleClickDelete = (e: React.MouseEvent<HTMLButtonElement>, problemId: string) => {
    e.stopPropagation();
    e.preventDefault();

    deleteProblemId.current = Number(problemId);
    openDeleteModal();
  };

  const handleMutateDelete = () => {
    if (!deleteProblemId.current) return;

    mutateDeleteProblem(
      {
        params: {
          path: {
            id: deleteProblemId.current,
          },
        },
      },
      {
        onSuccess: () => {
          closeDeleteModal();
          invalidateAll();
        },
      }
    );
  };

  const handleClickSearch = (data: GetProblemsSearchParams) => {
    const nextFilters = cleanSearchParams({ ...data, concepts: selectedTagList });
    setFilters((prev) => (areParamsEqual(prev, nextFilters) ? prev : nextFilters));
  };

  const handleResetQuery = () => {
    reset();
    setSelectedTagList([]);
    setFilters({});
  };

  const handleRemoveTag = (tag: number) => {
    setSelectedTagList((prev) => {
      const nextTagList = prev.filter((selectedTag) => selectedTag !== tag);
      setFilters((prevFilters) => {
        const nextFilters = cleanSearchParams({ ...prevFilters, concepts: nextTagList });
        return areParamsEqual(prevFilters, nextFilters) ? prevFilters : nextFilters;
      });
      return nextTagList;
    });
  };

  const handleChangeTagList = (tagList: number[]) => {
    setSelectedTagList(tagList);
    setFilters((prev) => {
      const nextFilters = cleanSearchParams({ ...prev, concepts: tagList });
      return areParamsEqual(prev, nextFilters) ? prev : nextFilters;
    });
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <Header title='문제'>
        <Header.Button
          Icon={Plus}
          color='main'
          onClick={() => navigate({ to: '/problem/register' })}>
          문제 등록
        </Header.Button>
      </Header>

      <div className='mx-auto max-w-7xl px-8 py-8'>
        <div className='mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white'>
          <div className='px-6 pt-6'>
            <h2 className='flex items-center gap-3 text-xl font-bold text-gray-900'>
              <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                <Search className='h-5 w-5 text-white' />
              </div>
              문제 검색
            </h2>
          </div>

          <form onSubmit={handleSubmit(handleClickSearch)} className='space-y-6 p-8'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div className='flex flex-col gap-2'>
                <label className='text-sm font-semibold text-gray-700'>문제 ID</label>
                <Input
                  type='text'
                  placeholder='문제 ID를 입력해주세요'
                  {...register('customId', { required: false })}
                />
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-sm font-semibold text-gray-700'>문제 제목</label>
                <Input
                  type='text'
                  placeholder='문제 제목을 입력해주세요'
                  {...register('title', { required: false })}
                />
              </div>

              <div className='flex flex-col gap-2'>
                <label className='text-sm font-semibold text-gray-700'>문제 개념 태그</label>
                <button
                  type='button'
                  onClick={openModal}
                  className='focus:border-main focus:ring-main/20 flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-100/50 focus:bg-white focus:ring-2 focus:outline-none'>
                  <span className='text-gray-400'>개념 태그를 선택해주세요</span>
                  <ChevronDown className='h-5 w-5 text-gray-400' />
                </button>
              </div>
            </div>

            <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
              <SegmentedControl
                value={watchedProblemType ?? PROBLEM_TYPE_ALL}
                onChange={(nextValue) => {
                  if (nextValue === PROBLEM_TYPE_ALL) {
                    setValue('problemType', undefined);
                    return;
                  }
                  setValue('problemType', nextValue as ProblemType);
                }}
                items={[
                  {
                    label: '전체',
                    value: PROBLEM_TYPE_ALL,
                    icon: LayoutList,
                  },
                  {
                    label: '메인 문제',
                    value: 'MAIN_PROBLEM',
                    icon: FileText,
                  },
                  {
                    label: '새끼 문제',
                    value: 'CHILD_PROBLEM',
                    icon: Files,
                  },
                ]}
              />

              <button
                type='button'
                onClick={handleResetQuery}
                className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                <RotateCcw className='h-4 w-4' />
                초기화
              </button>
            </div>

            {/* Selected Tags */}
            {selectedTagList.length > 0 && (
              <div className='flex flex-wrap gap-2 border-t border-gray-100 pt-6'>
                {selectedTagList.map((tag) => (
                  <Tag
                    key={tag}
                    label={tagsNameMap[tag] ?? ''}
                    color='dark'
                    removable
                    onClick={() => handleRemoveTag(tag)}
                  />
                ))}
              </div>
            )}
          </form>
        </div>

        {/* View Mode Toggle */}
        <div className='mb-6 flex items-center justify-between'>
          <p className='text-sm font-medium text-gray-600'>{problemItems.length}개의 문제</p>
          <SegmentedControl
            value={viewMode}
            onChange={(nextViewMode) => setViewMode(nextViewMode as 'table' | 'card')}
            items={[
              { label: '테이블', value: 'table', icon: List },
              { label: '카드', value: 'card', icon: Grid },
            ]}
          />
        </div>

        {isInitialLoading ? (
          <div className='flex min-h-[400px] w-full items-center justify-center rounded-2xl border border-gray-200 bg-white'>
            <div className='flex flex-col items-center gap-4'>
              <PulseLoader color='var(--color-main)' size={12} />
              <p className='text-sm font-medium text-gray-500'>문제를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white'>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-gray-100 bg-gray-50'>
                        <th className='w-24 px-6 py-4 text-left text-sm font-bold text-gray-700'>
                          ID
                        </th>
                        <th className='w-48 px-6 py-4 text-left text-sm font-bold text-gray-700'>
                          제목
                        </th>
                        <th className='px-6 py-4 text-left text-sm font-bold text-gray-700'>
                          문제 내용
                        </th>
                        <th className='w-40 px-6 py-4 text-left text-sm font-bold text-gray-700'>
                          메모
                        </th>
                        <th className='w-16 px-6 py-4'></th>
                      </tr>
                    </thead>
                    <tbody>
                      {problemItems.map(
                        ({ id: problemId, customId, title, memo, problemContent }) => {
                          const problemText = problemContent
                            ? JSON.stringify(JSON.parse(problemContent))
                            : '문제 내용이 없습니다.';

                          return (
                            <tr
                              key={problemId}
                              onClick={() =>
                                navigate({
                                  to: '/problem/$problemId',
                                  params: { problemId: problemId.toString() },
                                })
                              }
                              className='group hover:bg-main/5 cursor-pointer border-b border-gray-100 transition-all duration-200'>
                              <td className='px-6 py-4'>
                                <span className='bg-main/10 text-main inline-flex rounded-lg px-2 py-1 font-mono text-xs font-semibold'>
                                  {customId || '-'}
                                </span>
                              </td>
                              <td className='px-6 py-4'>
                                <span className='line-clamp-1 text-sm font-medium text-gray-900'>
                                  {title}
                                </span>
                              </td>
                              <td className='px-6 py-4'>
                                <span className='line-clamp-2 text-sm text-gray-600'>
                                  {problemText ? (
                                    <InlineProblemViewer maxLine={2}>
                                      {problemText}
                                    </InlineProblemViewer>
                                  ) : (
                                    '문제 내용이 없습니다.'
                                  )}
                                </span>
                              </td>
                              <td className='px-6 py-4'>
                                <span className='line-clamp-1 text-sm text-gray-600'>{memo}</span>
                              </td>
                              <td className='px-6 py-4'>
                                <button
                                  type='button'
                                  onClick={(e) => handleClickDelete(e, problemId.toString())}
                                  className='flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition-all duration-200 hover:border-red-200 hover:bg-red-100'>
                                  <Trash2 className='h-4 w-4' />
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {problemItems.map(
                  ({ id: problemId, customId, title, memo, problemContent, answer }) => {
                    const problemText = problemContent
                      ? JSON.stringify(JSON.parse(problemContent))
                      : '문제 내용이 없습니다.';

                    return (
                      <Link
                        key={problemId}
                        to={`/problem/$problemId`}
                        params={{ problemId: problemId.toString() }}
                        className='group'>
                        <ProblemCard
                          customId={customId}
                          title={title}
                          memo={memo}
                          problemText={problemText}
                          answer={answer?.toString() || '-'}
                          onDelete={(e) => handleClickDelete(e, problemId.toString())}
                        />
                      </Link>
                    );
                  }
                )}
              </div>
            )}
            <div ref={loadMoreRef} className='h-10 w-full' />
            {isFetching && hasMore && problemItems.length > 0 && (
              <div className='mt-6 flex items-center justify-center gap-3 text-sm text-gray-500'>
                <PulseLoader color='var(--color-main)' size={10} />
                <span>다음 페이지를 불러오는 중...</span>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal}>
        <TagSelectModal
          onClose={closeModal}
          selectedTagList={selectedTagList}
          handleChangeTagList={handleChangeTagList}
        />
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <TwoButtonModalTemplate
          text='문제를 삭제할까요?'
          leftButtonText='아니오'
          rightButtonText='예'
          handleClickLeftButton={closeDeleteModal}
          handleClickRightButton={handleMutateDelete}
        />
      </Modal>
    </div>
  );
}
