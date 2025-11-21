import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import PulseLoader from 'react-spinners/PulseLoader';
import { Search, ChevronDown, RotateCcw } from 'lucide-react';
import { getConcept, getProblemsSearch } from '@apis';
import { Modal, Tag, TagSelectModal, Input } from '@components';
import { useModal } from '@hooks';
import { components } from '@schema';
import { GetProblemsSearchParams } from '@types';
import { ProblemViewer } from '@team-ppointer/pointer-editor-v2';

type ProblemMetaResp = components['schemas']['ProblemMetaResp'];

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

interface ProblemSearchModalProps {
  onClickCard(problem: ProblemMetaResp): void;
}

const ProblemSearchModal = ({ onClickCard }: ProblemSearchModalProps) => {
  const { isOpen, openModal, closeModal } = useModal();

  const [filters, setFilters] = useState<GetProblemsSearchParams>({});
  const [selectedTagList, setSelectedTagList] = useState<number[]>([]);
  const [page, setPage] = useState(0);
  const [problemItems, setProblemItems] = useState<ProblemMetaResp[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { register, handleSubmit, reset, watch } = useForm<GetProblemsSearchParams>();

  const watchedCustomId = watch('customId');
  const watchedTitle = watch('title');

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const trimmedCustomId = (watchedCustomId ?? '').toString().trim();
      const trimmedTitle = (watchedTitle ?? '').toString().trim();

      setFilters((prev) => {
        const nextFilters = cleanSearchParams({
          ...prev,
          customId: trimmedCustomId || undefined,
          title: trimmedTitle || undefined,
        });

        if (areParamsEqual(prev, nextFilters)) {
          return prev;
        }

        return nextFilters;
      });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [watchedCustomId, watchedTitle]);

  const searchParams = useMemo<GetProblemsSearchParams>(
    () => ({
      ...filters,
      page,
      size: PAGE_SIZE,
      problemType: 'MAIN_PROBLEM',
    }),
    [filters, page]
  );

  const { data: problemList, isLoading, isFetching } = getProblemsSearch(searchParams);
  const { data: tagsData } = getConcept();
  const allTagList = tagsData?.data || [];
  const tagsNameMap = Object.fromEntries(allTagList.map((tag) => [tag.id, tag.name]));

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

      const mergedMap = new Map<number, ProblemMetaResp>();
      prev.forEach((item) => mergedMap.set(item.id, item));
      nextItems.forEach((item) => mergedMap.set(item.id, item));

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

  const handleClickSearch = (data: GetProblemsSearchParams) => {
    const filteredData = cleanSearchParams({ ...data, concepts: selectedTagList });
    setFilters((prev) => (areParamsEqual(prev, filteredData) ? prev : filteredData));
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
    <>
      <div className='flex h-[90dvh] w-[90dvw] flex-col'>
        <div className='flex-shrink-0 border-b border-gray-200 px-8 py-6'>
          <h2 className='flex items-center gap-3 text-2xl font-bold text-gray-900'>
            <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
              <Search className='h-5 w-5 text-white' />
            </div>
            문제 검색
          </h2>
        </div>

        <div className='flex-1 overflow-y-auto px-8 py-6'>
          <form onSubmit={handleSubmit(handleClickSearch)} className='space-y-6'>
            <div className='grid grid-cols-3 gap-4'>
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

            <div className='flex items-center justify-end gap-3'>
              <button
                type='button'
                onClick={handleResetQuery}
                className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                <RotateCcw className='h-4 w-4' />
                초기화
              </button>
            </div>

            {selectedTagList.length > 0 && (
              <div className='flex flex-wrap gap-2 border-t border-gray-100 pt-6'>
                {selectedTagList.map((tag) => (
                  <Tag
                    key={tag}
                    label={tagsNameMap[tag] || ''}
                    color='dark'
                    removable
                    onClick={() => handleRemoveTag(tag)}
                  />
                ))}
              </div>
            )}
          </form>

          {isInitialLoading ? (
            <div className='flex min-h-[300px] w-full items-center justify-center'>
              <div className='flex flex-col items-center gap-4'>
                <PulseLoader color='var(--color-main)' size={12} />
                <p className='text-sm font-medium text-gray-500'>문제를 불러오는 중...</p>
              </div>
            </div>
          ) : (
            <>
              {problemItems.length === 0 ? (
                <div className='mt-6 flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/50'>
                  <p className='text-sm font-medium text-gray-500'>검색 결과가 없습니다.</p>
                </div>
              ) : (
                <section className='mt-6 grid grid-cols-3 gap-6 pb-6'>
                  {problemItems.map((problem) => {
                    const { customId, title, memo, problemContent } = problem;
                    return (
                      <div
                        key={problem.id}
                        className='cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-sm'
                        onClick={() => onClickCard(problem)}>
                        <div className='flex flex-1 flex-col justify-center gap-0.5 border-b border-gray-200 p-4'>
                          <div className='flex items-center gap-2'>
                            <span className='bg-main/10 text-main inline-flex rounded-lg px-2 py-1 font-mono text-xs font-semibold'>
                              {customId || '-'}
                            </span>
                            <span className='line-clamp-2 text-sm font-semibold text-gray-900'>
                              {title || '제목 없음'}
                            </span>
                          </div>
                          <p className='line-clamp-2 text-xs text-gray-600'>{memo}</p>
                        </div>
                        <div className='relative h-60 overflow-hidden bg-gray-50'>
                          <ProblemViewer content={JSON.parse(problemContent)} padding={24} />
                        </div>
                      </div>
                    );
                  })}
                </section>
              )}
              <div ref={loadMoreRef} className='h-10 w-full' />
              {isFetching && hasMore && problemItems.length > 0 && (
                <div className='mt-4 flex items-center justify-center gap-3 text-sm text-gray-500'>
                  <PulseLoader color='var(--color-main)' size={10} />
                  <span>다음 페이지를 불러오는 중...</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal}>
        <TagSelectModal
          onClose={closeModal}
          selectedTagList={selectedTagList}
          handleChangeTagList={handleChangeTagList}
        />
      </Modal>
    </>
  );
};

export default ProblemSearchModal;
