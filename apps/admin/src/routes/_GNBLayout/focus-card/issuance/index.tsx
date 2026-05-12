import {
  deleteFocusCardIssuance,
  getConceptHistory,
  getFocusCardIssuanceByDate,
  postFocusCardAutoIssue,
  postFocusCardIssuance,
} from '@apis';
import { Button, Header, Modal, TwoButtonModalTemplate } from '@components';
import { useActionNodeTypeId, useInvalidate, useModal, useSelectedStudent } from '@hooks';
import { InlineProblemViewer } from '@repo/pointer-editor-v2';
import { createFileRoute } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { AlertTriangle, Layers, Plus, Trash2, Wand2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Slide, toast, ToastContainer } from 'react-toastify';

import { NodeSearchSelect } from '@/components/conceptGraph';

import '@repo/pointer-editor-v2/style.css';

export const Route = createFileRoute('/_GNBLayout/focus-card/issuance/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { selectedStudent } = useSelectedStudent();
  const { invalidateFocusCardIssuanceByDate } = useInvalidate();
  const actionNodeTypeId = useActionNodeTypeId();

  const [issuedDate, setIssuedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));

  const studentId = selectedStudent?.id ?? 0;
  const isStudentSelected = !!selectedStudent;

  const { data: issuanceResp, isLoading } = getFocusCardIssuanceByDate(
    { studentId, issuedDate },
    { enabled: isStudentSelected }
  );

  const { data: conceptHistory, isLoading: isHistoryLoading } = getConceptHistory(studentId, {
    enabled: isStudentSelected,
  });

  const vulnerableConcepts = useMemo(() => {
    const stats = conceptHistory?.conceptStats ?? [];
    // 시도 횟수 5회 이상 + 정답률 낮은 순. 시도 횟수가 너무 적으면 노이즈라 제외.
    return [...stats]
      .filter((s) => (s.totalAttempts ?? 0) >= 5)
      .sort((a, b) => (a.correctRate ?? 100) - (b.correctRate ?? 100))
      .slice(0, 5);
  }, [conceptHistory]);

  const { mutate: mutateIssue, isPending: isIssuing } = postFocusCardIssuance();
  const { mutate: mutateRevoke } = deleteFocusCardIssuance();
  const { mutate: mutateAutoIssue, isPending: isAutoIssuing } = postFocusCardAutoIssue();

  const { isOpen: isIssueOpen, openModal: openIssue, closeModal: closeIssue } = useModal();
  const { isOpen: isRevokeOpen, openModal: openRevoke, closeModal: closeRevoke } = useModal();
  const {
    isOpen: isAutoIssueOpen,
    openModal: openAutoIssue,
    closeModal: closeAutoIssue,
  } = useModal();

  const [revokeTarget, setRevokeTarget] = useState<{ id: number; name: string } | null>(null);
  const [issueActionNodeId, setIssueActionNodeId] = useState<number | undefined>(undefined);
  const [issueActionNodeError, setIssueActionNodeError] = useState(false);

  const issuances = issuanceResp?.data ?? [];

  const handleClickRevoke = (id: number, name: string) => {
    setRevokeTarget({ id, name });
    openRevoke();
  };

  const handleConfirmRevoke = () => {
    if (!revokeTarget) return;
    mutateRevoke(
      { params: { path: { id: revokeTarget.id } } },
      {
        onSuccess: () => {
          invalidateFocusCardIssuanceByDate(studentId, issuedDate);
          toast.success('발급이 취소되었습니다');
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      }
    );
    closeRevoke();
    setRevokeTarget(null);
  };

  const handleSubmitIssue = () => {
    if (!issueActionNodeId) {
      setIssueActionNodeError(true);
      return;
    }
    setIssueActionNodeError(false);
    mutateIssue(
      {
        body: {
          studentId,
          actionNodeId: issueActionNodeId,
          issuedDate,
        },
      },
      {
        onSuccess: () => {
          invalidateFocusCardIssuanceByDate(studentId, issuedDate);
          toast.success('카드가 발급되었습니다');
          closeIssue();
          setIssueActionNodeId(undefined);
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const handleConfirmAutoIssue = () => {
    mutateAutoIssue(
      { params: { query: { studentId } } },
      {
        onSuccess: (data) => {
          invalidateFocusCardIssuanceByDate(studentId, issuedDate);
          toast.success(`자동 발급 완료: ${data?.total ?? 0}개 카드 발급`);
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      }
    );
    closeAutoIssue();
  };

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
        <Header title='집중학습 카드 발급'>
          {isStudentSelected && (
            <div className='flex items-center gap-2'>
              <Header.Button Icon={Wand2} color='gray' onClick={openAutoIssue}>
                {isAutoIssuing ? '실행 중...' : '자동 발급 실행'}
              </Header.Button>
              <Header.Button Icon={Plus} color='main' onClick={openIssue}>
                카드 발급
              </Header.Button>
            </div>
          )}
        </Header>

        <div className='mx-auto max-w-6xl space-y-6 px-8 pb-12'>
          <section className='flex flex-wrap items-end gap-4 rounded-2xl border border-gray-200 bg-white p-6'>
            <div className='flex-1 space-y-2'>
              <p className='text-xs font-semibold text-gray-500'>학생</p>
              <p className='text-base font-bold text-gray-900'>
                {selectedStudent ? selectedStudent.name : '좌측에서 학생을 선택해 주세요'}
              </p>
            </div>
            <div className='space-y-2'>
              <label className='block text-xs font-semibold text-gray-500'>발급 일자</label>
              <input
                type='date'
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
                className='focus:border-main focus:ring-main/20 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium focus:ring-2 focus:outline-none'
              />
            </div>
          </section>

          {isStudentSelected && (
            <section className='space-y-3 rounded-2xl border border-amber-200 bg-amber-50/40 p-6'>
              <div className='flex items-center gap-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700'>
                  <AlertTriangle className='h-4 w-4' />
                </div>
                <h3 className='text-base font-bold text-gray-900'>학생 취약점</h3>
                <span className='text-xs text-gray-500'>
                  (시도 5회 이상 · 정답률 낮은 순 상위 5개)
                </span>
              </div>

              {isHistoryLoading ? (
                <p className='py-4 text-center text-sm text-gray-400'>취약점 분석 중...</p>
              ) : vulnerableConcepts.length === 0 ? (
                <p className='py-4 text-center text-sm text-gray-500'>
                  분석할 만큼 풀이 데이터가 충분하지 않습니다. (개념별 5회 이상 시도 필요)
                </p>
              ) : (
                <div className='grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-5'>
                  {vulnerableConcepts.map((stat) => {
                    const rate = stat.correctRate ?? 0;
                    const isCritical = rate < 40;
                    const isWarning = rate >= 40 && rate < 60;
                    return (
                      <div
                        key={stat.conceptId}
                        className='space-y-1 rounded-xl border border-gray-200 bg-white p-3'>
                        <p className='line-clamp-2 text-xs font-semibold text-gray-800'>
                          {stat.conceptName ?? '이름 없음'}
                        </p>
                        <div className='flex items-baseline gap-1'>
                          <span
                            className={`text-lg font-bold ${
                              isCritical
                                ? 'text-red-600'
                                : isWarning
                                  ? 'text-amber-600'
                                  : 'text-gray-700'
                            }`}>
                            {Math.round(rate)}%
                          </span>
                          <span className='text-[10px] text-gray-400'>정답률</span>
                        </div>
                        <p className='text-[10px] text-gray-500'>
                          {stat.correctCount ?? 0} / {stat.totalAttempts ?? 0}회 정답
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {vulnerableConcepts.length > 0 && (
                <p className='pt-1 text-[11px] text-gray-500'>
                  ※ 개념(Concept)과 카드의 Action Node는 다른 축이므로, 위 취약 개념을 참고해 직접
                  '카드 발급'으로 적절한 Action Node를 골라 발급하세요.
                </p>
              )}
            </section>
          )}

          {!isStudentSelected ? (
            <div className='flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white'>
              <Layers className='h-8 w-8 text-gray-300' />
              <p className='text-base font-semibold text-gray-700'>학생을 선택해 주세요</p>
              <p className='text-sm text-gray-400'>
                사이드바의 '학생 선택'에서 학생을 고른 뒤 발급 내역을 확인할 수 있어요.
              </p>
            </div>
          ) : isLoading ? (
            <div className='flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white'>
              <p className='text-sm text-gray-400'>불러오는 중...</p>
            </div>
          ) : issuances.length === 0 ? (
            <div className='flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white'>
              <p className='text-base font-semibold text-gray-700'>
                해당 일자에 발급된 카드가 없습니다
              </p>
              <p className='text-sm text-gray-400'>
                상단 '카드 발급' 또는 '자동 발급 실행' 버튼을 눌러 보세요.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {issuances.map((issuance) => (
                <div
                  key={issuance.id}
                  className='flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <span className='bg-main/10 text-main inline-block rounded-md px-2 py-0.5 text-xs font-semibold'>
                        {issuance.card.actionNode.name}
                      </span>
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
                          issuance.issuedType === 'ADMIN'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                        {issuance.issuedType === 'ADMIN' ? '관리자 발급' : '자동 발급'}
                      </span>
                    </div>
                    <button
                      type='button'
                      onClick={() => handleClickRevoke(issuance.id, issuance.card.actionNode.name)}
                      className='flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600'>
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-gray-400'>제목</p>
                    <InlineProblemViewer maxLine={1}>{issuance.card.title}</InlineProblemViewer>
                  </div>
                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-gray-400'>설명</p>
                    <InlineProblemViewer maxLine={2}>
                      {issuance.card.description}
                    </InlineProblemViewer>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isIssueOpen}
        onClose={() => {
          closeIssue();
          setIssueActionNodeId(undefined);
          setIssueActionNodeError(false);
        }}>
        <div className='flex w-[480px] flex-col gap-5 px-8 py-6'>
          <h2 className='text-lg font-bold text-gray-900'>카드 발급</h2>
          <div className='space-y-2'>
            <p className='text-xs font-semibold text-gray-500'>학생</p>
            <p className='text-base font-bold text-gray-900'>{selectedStudent?.name}</p>
          </div>
          <div className='space-y-2'>
            <p className='text-xs font-semibold text-gray-500'>발급 일자</p>
            <p className='text-base font-bold text-gray-900'>{issuedDate}</p>
          </div>
          <div className='space-y-2'>
            <label className='block text-xs font-semibold text-gray-500'>Action Node</label>
            {actionNodeTypeId === undefined ? (
              <p className='py-3 text-xs text-gray-400'>
                Action Node 타입 정보를 불러오는 중입니다...
              </p>
            ) : (
              <NodeSearchSelect
                value={issueActionNodeId}
                onChange={(id) => {
                  setIssueActionNodeId(id);
                  if (id !== undefined) setIssueActionNodeError(false);
                }}
                nodeTypeId={actionNodeTypeId}
                placeholder='Action Node 검색'
                hasError={issueActionNodeError}
              />
            )}
          </div>
          <div className='flex justify-end gap-2'>
            <Button
              variant='light'
              sizeType='md'
              onClick={() => {
                closeIssue();
                setIssueActionNodeId(undefined);
                setIssueActionNodeError(false);
              }}>
              취소
            </Button>
            <Button
              variant='primary'
              sizeType='md'
              onClick={handleSubmitIssue}
              disabled={isIssuing}>
              {isIssuing ? '발급 중...' : '발급'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isRevokeOpen} onClose={closeRevoke}>
        <TwoButtonModalTemplate
          text={`'${revokeTarget?.name ?? ''}' 카드 발급을 취소하시겠어요?`}
          leftButtonText='취소'
          rightButtonText='발급 취소'
          variant='danger'
          handleClickLeftButton={closeRevoke}
          handleClickRightButton={handleConfirmRevoke}
        />
      </Modal>

      <Modal isOpen={isAutoIssueOpen} onClose={closeAutoIssue}>
        <TwoButtonModalTemplate
          text={`'${selectedStudent?.name ?? ''}' 학생에 대해 자동 발급을 실행할까요?`}
          leftButtonText='취소'
          rightButtonText='실행'
          handleClickLeftButton={closeAutoIssue}
          handleClickRightButton={handleConfirmAutoIssue}
        />
      </Modal>
    </>
  );
}
