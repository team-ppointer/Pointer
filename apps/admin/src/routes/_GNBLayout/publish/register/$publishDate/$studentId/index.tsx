import { getProblemSetSearch, getPublishFocusCardLinkCandidates, postPublish } from '@apis';
import { components } from '@schema';
import { Header, Input, ProblemPreview } from '@components';
import { useInvalidate } from '@hooks';
import { InlineProblemViewer } from '@repo/pointer-editor-v2';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { GetProblemSetSearchParams } from '@types';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Slide, toast, ToastContainer } from 'react-toastify';
import {
  Search,
  RotateCcw,
  FileText,
  ChevronDown,
  ChevronUp,
  Send,
  Pencil,
  Circle,
  CircleCheck,
  Sparkles,
} from 'lucide-react';

import '@repo/pointer-editor-v2/style.css';

export const Route = createFileRoute('/_GNBLayout/publish/register/$publishDate/$studentId/')({
  component: RouteComponent,
});

const EMPTY_PROBLEM_CONTENT = JSON.stringify({ blocks: [] });

const getProblemContentString = (problemContent?: unknown): string => {
  if (!problemContent) return EMPTY_PROBLEM_CONTENT;

  if (typeof problemContent === 'string') {
    try {
      JSON.parse(problemContent);
      return problemContent;
    } catch (error) {
      console.error('Invalid problem content string', error);
      return EMPTY_PROBLEM_CONTENT;
    }
  }

  try {
    return JSON.stringify(problemContent);
  } catch (error) {
    console.error('Failed to stringify problem content', error);
    return EMPTY_PROBLEM_CONTENT;
  }
};

function RouteComponent() {
  const { invalidatePublish } = useInvalidate();
  const { navigate } = useRouter();
  const { publishDate, studentId } = Route.useParams();
  const dateArr = publishDate.split('-');
  const year = dateArr[0];
  const month = dateArr[1];
  const day = dateArr[2];

  // state
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<GetProblemSetSearchParams>({});
  const [expandedSets, setExpandedSets] = useState<Set<number>>(new Set());
  // problemSetItemId -> Set<focusCardIssuanceId>
  const [linkMap, setLinkMap] = useState<Record<number, Set<number>>>({});

  // api
  const { data: problemSetList } = getProblemSetSearch(searchQuery);
  const { mutate: mutatePostPublish } = postPublish();
  const numericStudentId = Number(studentId);

  // problemSet 선택 시 BE에 일괄 후보 조회 — 응답은 problemSetItemId 별로 매칭된 카드 발급만 포함.
  // BE 가 POST 로 노출하지만 read-only 조회이므로 useQuery 사용. 빈 응답(매칭 없음)도 정상 케이스.
  const isCandidatesQueryEnabled =
    !!selectedSetId && Number.isFinite(numericStudentId) && numericStudentId > 0;
  const { data: candidatesResp } = getPublishFocusCardLinkCandidates(
    {
      studentId: numericStudentId,
      problemSetId: selectedSetId ?? 0,
      targetDate: publishDate,
    },
    { enabled: isCandidatesQueryEnabled }
  );
  type CandidatesByItem = Map<number, components['schemas']['FocusCardIssuanceResp'][]>;
  const candidatesByItem: CandidatesByItem = useMemo(() => {
    const map: CandidatesByItem = new Map();
    candidatesResp?.data?.forEach((entry) => {
      map.set(entry.problemSetItemId, entry.candidates);
    });
    return map;
  }, [candidatesResp]);

  const { register, handleSubmit, reset, watch } = useForm<GetProblemSetSearchParams>();

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

  // 선택된 세트의 아이템 펼침 자동 유지
  useEffect(() => {
    if (selectedSetId == null) return;
    setExpandedSets((prev) => {
      if (prev.has(selectedSetId)) return prev;
      const next = new Set(prev);
      next.add(selectedSetId);
      return next;
    });
  }, [selectedSetId]);

  // linkMap 은 problemSetItemId 키를 사용하므로 세트가 바뀌어도 키가 충돌하지 않는다.
  // 발행 시점에 현재 선택된 세트의 item 만 필터링해 BE 검증 통과를 보장한다.
  // 따라서 세트 전환 시에도 상태를 보존해 작업 손실을 방지한다.

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

  const toggleLink = (problemSetItemId: number, focusCardIssuanceId: number) => {
    setLinkMap((prev) => {
      const next = { ...prev };
      const set = new Set(next[problemSetItemId] ?? []);
      if (set.has(focusCardIssuanceId)) {
        set.delete(focusCardIssuanceId);
      } else {
        set.add(focusCardIssuanceId);
      }
      if (set.size === 0) {
        delete next[problemSetItemId];
      } else {
        next[problemSetItemId] = set;
      }
      return next;
    });
  };

  const selectedSet = useMemo(
    () => problemSetList?.data?.find((s) => s.id === selectedSetId),
    [problemSetList, selectedSetId]
  );

  const focusCardLinks = useMemo(() => {
    if (!selectedSet) return [];
    const allowedItemIds = new Set(selectedSet.problems.map((p) => p.id));
    const links: { problemSetItemId: number; focusCardIssuanceId: number }[] = [];
    Object.entries(linkMap).forEach(([itemIdStr, ids]) => {
      const problemSetItemId = Number(itemIdStr);
      if (!allowedItemIds.has(problemSetItemId)) return;
      ids.forEach((focusCardIssuanceId) => {
        links.push({ problemSetItemId, focusCardIssuanceId });
      });
    });
    return links;
  }, [linkMap, selectedSet]);

  const handleClickPublish = () => {
    if (!selectedSetId || !studentId) return;

    mutatePostPublish(
      {
        body: {
          publishAt: publishDate,
          problemSetId: selectedSetId,
          studentId: Number(studentId),
          ...(focusCardLinks.length > 0 ? { focusCardLinks } : {}),
        },
      },
      {
        onSuccess: () => {
          invalidatePublish(Number(year), Number(month));
          navigate({ to: '/publish' });
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      }
    );
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
        theme='light'
        transition={Slide}
      />
      <div className='min-h-screen bg-gray-50'>
        <Header title={`${month}월 ${day}일 발행`}>
          {selectedSetId && (
            <Header.Button Icon={Send} color='main' onClick={handleClickPublish}>
              발행하기
            </Header.Button>
          )}
        </Header>
        <div className='mx-auto max-w-7xl px-8 py-8'>
          <div className='mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white'>
            <div className='px-6 pt-6'>
              <h2 className='flex items-center gap-3 text-xl font-bold text-gray-900'>
                <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
                  <Search className='h-5 w-5 text-white' />
                </div>
                세트 검색
              </h2>
            </div>
            <form
              className='flex flex-col gap-4 p-8 lg:flex-row lg:items-end'
              onSubmit={handleSubmit(handleClickSearch)}>
              <div className='flex-1 space-y-2'>
                <label className='block text-sm font-semibold text-gray-700'>세트 제목</label>
                <Input
                  placeholder='세트 제목을 입력해주세요'
                  {...register('setTitle', { required: false })}
                />
              </div>
              <div className='flex-1 space-y-2'>
                <label className='block text-sm font-semibold text-gray-700'>문제 제목</label>
                <Input
                  placeholder='문제 제목을 입력해주세요'
                  {...register('problemTitle', { required: false })}
                />
              </div>
              <button
                type='button'
                onClick={handleResetQuery}
                className='flex h-[45.8px] items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                <RotateCcw className='h-4 w-4' />
                초기화
              </button>
            </form>
          </div>

          <div className='space-y-4'>
            {problemSetList?.data?.length ? (
              problemSetList.data.map((problemSet) => {
                const isSelected = selectedSetId === problemSet.id;
                const problemCount = problemSet.problems.length;

                return (
                  <div
                    key={problemSet.id}
                    className={`overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${
                      isSelected ? 'border-main shadow-xl shadow-gray-200/40' : 'border-gray-200'
                    }`}>
                    <div
                      className='cursor-pointer border-b border-gray-100 px-6 py-5 transition-all duration-200 hover:bg-gray-50'
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSetExpanded(problemSet.id);
                      }}>
                      <div className='flex flex-wrap items-center justify-between gap-4'>
                        <div className='flex items-center gap-4'>
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${isSelected ? 'bg-main text-white' : 'border-gray-200 bg-gray-100 text-gray-500'}`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedSetId(problemSet.id);
                            }}>
                            {isSelected ? (
                              <CircleCheck className='h-5 w-5' />
                            ) : (
                              <Circle className='h-5 w-5' />
                            )}
                          </div>
                          <div>
                            <h3 className='text-lg font-bold text-gray-900'>{problemSet.title}</h3>
                            <p className='text-sm text-gray-500'>문제 {problemCount}개</p>
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Link
                            to={'/problem-set/$problemSetId'}
                            params={{
                              problemSetId: problemSet.id?.toString(),
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className='flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                            <Pencil className='h-4 w-4' />
                          </Link>
                          <button
                            type='button'
                            className='flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50'>
                            {expandedSets.has(problemSet.id) ? (
                              <ChevronUp className='h-4 w-4' />
                            ) : (
                              <ChevronDown className='h-4 w-4' />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {expandedSets.has(problemSet.id) && (
                      <div className='space-y-6 px-6 py-6'>
                        {problemCount === 0 ? (
                          <div className='flex flex-col items-center justify-center py-12 text-center'>
                            <FileText className='mb-3 h-12 w-12 text-gray-300' />
                            <p className='text-sm font-medium text-gray-500'>문제가 없습니다</p>
                          </div>
                        ) : (
                          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                            {problemSet.problems.map((problem, index) => {
                              const problemContentString = getProblemContentString(
                                problem.problem.problemContent
                              );

                              return (
                                <ProblemPreview
                                  key={`problem-${index}`}
                                  title={problem.problem.title ?? ''}
                                  memo={problem.problem.memo ?? ''}
                                  problemContent={problemContentString}
                                />
                              );
                            })}
                          </div>
                        )}

                        {isSelected && (
                          <div className='space-y-4 rounded-2xl border border-gray-200 bg-gray-50/60 p-5'>
                            <div className='flex items-center gap-2'>
                              <div className='bg-main/10 text-main flex h-8 w-8 items-center justify-center rounded-xl'>
                                <Sparkles className='h-4 w-4' />
                              </div>
                              <h4 className='text-base font-bold text-gray-900'>
                                출제근거 카드 매핑
                              </h4>
                              <span className='text-xs text-gray-500'>
                                ({publishDate} · 문제별 매칭 카드만 표시)
                              </span>
                            </div>

                            {problemCount === 0 ? (
                              <p className='py-4 text-center text-sm text-gray-500'>
                                세트에 문제가 없어 매핑할 수 없습니다.
                              </p>
                            ) : (
                              <div className='space-y-3'>
                                {problemSet.problems.map((item) => {
                                  const linked = linkMap[item.id] ?? new Set();
                                  const candidates = candidatesByItem.get(item.id) ?? [];
                                  return (
                                    <div
                                      key={`map-${item.id}`}
                                      className='rounded-xl border border-gray-200 bg-white p-4'>
                                      <div className='mb-3 flex items-center gap-2'>
                                        <span className='inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-gray-100 px-2 text-xs font-bold text-gray-700'>
                                          {item.no}
                                        </span>
                                        <p className='truncate text-sm font-semibold text-gray-800'>
                                          {item.problem.title ?? '제목 없음'}
                                        </p>
                                      </div>
                                      {candidates.length === 0 ? (
                                        <p className='text-xs text-gray-400'>
                                          이 문제와 매칭되는 발급 카드가 없습니다.
                                        </p>
                                      ) : (
                                        <div className='flex flex-wrap gap-2'>
                                          {candidates.map((iss) => {
                                            const isOn = linked.has(iss.id);
                                            return (
                                              <button
                                                key={`${item.id}-${iss.id}`}
                                                type='button'
                                                onClick={() => toggleLink(item.id, iss.id)}
                                                className={`flex max-w-full items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                                                  isOn
                                                    ? 'border-main bg-main text-white'
                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                                }`}>
                                                <span className='shrink-0'>
                                                  {iss.card.actionNode.name}
                                                </span>
                                                <span
                                                  className={`max-w-[200px] truncate font-normal ${isOn ? 'text-white/90' : 'text-gray-500'}`}>
                                                  <InlineProblemViewer maxLine={1}>
                                                    {iss.card.title}
                                                  </InlineProblemViewer>
                                                </span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className='flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white'>
                <div className='text-center'>
                  <p className='text-base font-semibold text-gray-900'>세트를 찾을 수 없어요</p>
                  <p className='mt-1 text-sm text-gray-500'>
                    검색 조건을 변경해 다시 시도해 주세요.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
