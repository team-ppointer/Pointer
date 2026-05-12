import {
  deletePublishFocusCardLink,
  getFocusCardIssuanceCandidates,
  getProblemSetById,
  getPublishById,
  postPublishFocusCardLink,
} from '@apis';
import { Header, Modal } from '@components';
import { useInvalidate, useModal, useSelectedStudent } from '@hooks';
import { InlineProblemViewer } from '@repo/pointer-editor-v2';
import { components } from '@schema';
import { createFileRoute } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { AlertCircle, FileText, Plus, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Slide, toast, ToastContainer } from 'react-toastify';

import '@repo/pointer-editor-v2/style.css';

export const Route = createFileRoute('/_GNBLayout/publish/$publishId/')({
  component: RouteComponent,
});

type FocusCardLink = components['schemas']['PublishFocusCardLinkResp'];
type FocusCardIssuance = components['schemas']['FocusCardIssuanceResp'];

function RouteComponent() {
  const { publishId: publishIdStr } = Route.useParams();
  const publishId = Number(publishIdStr);

  const { selectedStudent } = useSelectedStudent();
  const { invalidatePublishDetail, invalidatePublish } = useInvalidate();

  const { data: publish, isLoading: isPublishLoading } = getPublishById({ id: publishId });
  const problemSetId = publish?.problemSet?.id ?? 0;
  const { data: problemSet } = getProblemSetById({ id: problemSetId });

  const { mutate: mutateAddLink } = postPublishFocusCardLink();
  const { mutate: mutateDeleteLink } = deletePublishFocusCardLink();

  const { isOpen: isAddOpen, openModal: openAdd, closeModal: closeAdd } = useModal();
  const [addTarget, setAddTarget] = useState<{
    problemSetItemId: number;
    problemId: number;
    problemTitle: string;
  } | null>(null);

  // 모달이 열렸을 때만 해당 problem 의 매칭 후보를 조회. studentId 는 사이드바 선택 학생에서 가져옴.
  const { data: candidatesResp, isLoading: isCandidatesLoading } = getFocusCardIssuanceCandidates(
    {
      studentId: selectedStudent?.id ?? 0,
      problemId: addTarget?.problemId ?? 0,
      targetDate: publish?.publishAt ?? dayjs().format('YYYY-MM-DD'),
    },
    {
      enabled: isAddOpen && !!selectedStudent && !!addTarget?.problemId && !!publish?.publishAt,
    }
  );

  const linksByItem = useMemo(() => {
    if (!publish) return new Map<number, FocusCardLink[]>();
    const map = new Map<number, FocusCardLink[]>();
    publish.data?.forEach((group) => {
      group.focusCards?.forEach((link) => {
        const list = map.get(link.problemSetItemId) ?? [];
        list.push(link);
        map.set(link.problemSetItemId, list);
      });
    });
    return map;
  }, [publish]);

  const handleClickAdd = (problemSetItemId: number, problemId: number, problemTitle: string) => {
    setAddTarget({ problemSetItemId, problemId, problemTitle });
    openAdd();
  };

  // problemSetItemId -> problemId 매핑은 publish.data 의 그룹 순서와 problemSet.problems 의 순서가
  // no 기준으로 동일하다고 가정. 안전하게 problemSet 의 item.problem.id 를 직접 사용.

  const handleConfirmAdd = (issuance: FocusCardIssuance) => {
    if (!addTarget) return;
    mutateAddLink(
      {
        params: { path: { publishId } },
        body: {
          problemSetItemId: addTarget.problemSetItemId,
          focusCardIssuanceId: issuance.id,
        },
      },
      {
        onSuccess: () => {
          invalidatePublishDetail(publishId);
          if (publish?.publishAt) {
            const d = dayjs(publish.publishAt);
            invalidatePublish(d.year(), d.month() + 1);
          }
          toast.success('출제근거 카드가 매핑되었습니다');
          closeAdd();
          setAddTarget(null);
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const handleDeleteLink = (linkId: number) => {
    mutateDeleteLink(
      { params: { path: { linkId } } },
      {
        onSuccess: () => {
          invalidatePublishDetail(publishId);
          if (publish?.publishAt) {
            const d = dayjs(publish.publishAt);
            invalidatePublish(d.year(), d.month() + 1);
          }
          toast.success('매핑이 해제되었습니다');
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      }
    );
  };

  if (isPublishLoading || !publish) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-sm text-gray-400'>불러오는 중...</p>
      </div>
    );
  }

  const candidates = candidatesResp?.data ?? [];
  const problemSetItems = problemSet?.problems ?? [];

  return (
    <>
      <ToastContainer
        position='top-center'
        autoClose={1500}
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
        <Header title={`${dayjs(publish.publishAt).format('M월 D일')} 발행 상세`}>
          <div />
        </Header>

        <div className='mx-auto max-w-5xl space-y-6 px-8 pb-12'>
          {!selectedStudent && (
            <div className='flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4'>
              <AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600' />
              <p className='text-sm text-amber-700'>
                사이드바에서 학생을 선택하면 출제근거 카드 후보를 확인할 수 있습니다.
              </p>
            </div>
          )}

          <section className='rounded-2xl border border-gray-200 bg-white p-6'>
            <p className='text-xs font-semibold text-gray-500'>문제 세트</p>
            <h2 className='mt-1 text-xl font-bold text-gray-900'>
              {publish.problemSet?.title ?? '제목 없음'}
            </h2>
            <p className='mt-1 text-sm text-gray-500'>
              발행일: {publish.publishAt} · 진행: {publish.progress}
            </p>
          </section>

          {problemSetItems.length === 0 ? (
            <div className='flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white'>
              <p className='text-sm text-gray-400'>문제가 없습니다</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {problemSetItems.map((item) => {
                const links = linksByItem.get(item.id) ?? [];
                return (
                  <div
                    key={item.id}
                    className='space-y-3 rounded-2xl border border-gray-200 bg-white p-5'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex items-start gap-3'>
                        <span className='inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-gray-100 px-2 text-xs font-bold text-gray-700'>
                          {item.no}
                        </span>
                        <div>
                          <p className='text-sm font-bold text-gray-900'>
                            {item.problem.title ?? '제목 없음'}
                          </p>
                          {item.problem.memo && (
                            <p className='mt-0.5 text-xs text-gray-500'>{item.problem.memo}</p>
                          )}
                        </div>
                      </div>
                      <button
                        type='button'
                        onClick={() =>
                          handleClickAdd(item.id, item.problem.id, item.problem.title ?? '')
                        }
                        className='hover:border-main hover:bg-main/5 hover:text-main flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-all duration-150'>
                        <Plus className='h-3.5 w-3.5' />
                        카드 매핑
                      </button>
                    </div>

                    {links.length > 0 ? (
                      <div className='flex flex-wrap gap-2'>
                        {links.map((link) => (
                          <div
                            key={link.id}
                            className='bg-main/10 text-main flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold'>
                            <Sparkles className='h-3.5 w-3.5' />
                            <span>{link.focusCardIssuance.card.actionNode.name}</span>
                            <span className='max-w-[200px] truncate font-normal opacity-80'>
                              <InlineProblemViewer maxLine={1}>
                                {link.focusCardIssuance.card.title}
                              </InlineProblemViewer>
                            </span>
                            <button
                              type='button'
                              onClick={() => handleDeleteLink(link.id)}
                              className='hover:bg-main/20 flex h-5 w-5 items-center justify-center rounded-md transition-all duration-150'>
                              <X className='h-3 w-3' />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-xs text-gray-400'>매핑된 카드가 없습니다</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          closeAdd();
          setAddTarget(null);
        }}>
        <div className='flex max-h-[80vh] w-[520px] flex-col gap-4 px-8 py-6'>
          <div>
            <h2 className='text-lg font-bold text-gray-900'>출제근거 카드 매핑</h2>
            <p className='mt-1 text-xs text-gray-500'>
              문제: <span className='font-semibold'>{addTarget?.problemTitle ?? ''}</span>
            </p>
            <p className='mt-0.5 text-[11px] text-gray-400'>
              이 문제의 포인팅·버블 액션과 매칭되는 발급 카드만 표시됩니다.
            </p>
          </div>

          <div className='flex-1 overflow-y-auto'>
            {!selectedStudent ? (
              <p className='py-6 text-center text-sm text-gray-400'>
                학생이 선택되지 않아 후보 카드를 불러올 수 없습니다.
              </p>
            ) : isCandidatesLoading ? (
              <p className='py-6 text-center text-sm text-gray-400'>후보 카드 조회 중...</p>
            ) : candidates.length === 0 ? (
              <div className='flex flex-col items-center gap-2 py-8 text-center'>
                <FileText className='h-8 w-8 text-gray-300' />
                <p className='text-sm font-semibold text-gray-700'>매칭되는 발급 카드가 없습니다</p>
                <p className='text-xs text-gray-400'>
                  이 문제의 포인팅·버블 액션과 일치하는 발급 카드가 없어요.
                  <br />
                  '집중학습 카드 발급' 화면에서 적절한 카드를 먼저 발급해 주세요.
                </p>
              </div>
            ) : (
              <ul className='space-y-2'>
                {candidates.map((iss) => (
                  <li key={iss.id}>
                    <button
                      type='button'
                      onClick={() => handleConfirmAdd(iss)}
                      className='hover:border-main flex w-full flex-col items-start gap-1 rounded-xl border border-gray-200 bg-white p-3 text-left transition-all duration-150 hover:bg-gray-50'>
                      <div className='flex items-center gap-2'>
                        <span className='bg-main/10 text-main inline-block rounded-md px-2 py-0.5 text-xs font-semibold'>
                          {iss.card.actionNode.name}
                        </span>
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
                            iss.issuedType === 'ADMIN'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                          {iss.issuedType === 'ADMIN' ? '관리자' : '자동'}
                        </span>
                      </div>
                      <div className='w-full text-sm font-medium text-gray-800'>
                        <InlineProblemViewer maxLine={1}>{iss.card.title}</InlineProblemViewer>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
