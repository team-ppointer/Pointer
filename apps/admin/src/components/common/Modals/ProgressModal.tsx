import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { InlineProblemViewer, ProblemViewer } from '@repo/pointer-editor-v2';
import { components } from '@schema';
import { parseEditorContent } from '@utils';
import { Calendar, CheckCircle2, Clock, FileText, Package, X } from 'lucide-react';

import 'dayjs/locale/ko';

dayjs.locale('ko');

interface ProgressModalProps {
  publishData: components['schemas']['PublishResp'];
  onClose: () => void;
}

type PublishProgress = components['schemas']['PublishResp']['progress'];
type StudyStatus = components['schemas']['ProblemWithStudyInfoResp']['progress'];

const PROGRESS_META: Record<PublishProgress, { label: string; className: string }> = {
  DONE: {
    label: '완료',
    className: 'border-green-200 bg-green-50 text-green-700',
  },
  DOING: {
    label: '진행 중',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  NONE: {
    label: '시작 전',
    className: 'border-gray-200 bg-gray-50 text-gray-600',
  },
};

const STATUS_META: Record<NonNullable<StudyStatus>, { label: string; className: string }> = {
  CORRECT: { label: '정답', className: 'border-green-200 bg-green-50 text-green-700' },
  INCORRECT: { label: '오답', className: 'border-red-200 bg-red-50 text-red-600' },
  SEMI_CORRECT: {
    label: '부분 정답',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  NONE: { label: '미제출', className: 'border-gray-200 bg-gray-50 text-gray-600' },
};

const UNDERSTAND_META = {
  true: {
    label: '이해',
    className: 'border-green-200 bg-green-50 text-green-700',
  },
  false: {
    label: '미이해',
    className: 'border-red-200 bg-red-50 text-red-600',
  },
  null: {
    label: '미응답',
    className: 'border-gray-200 bg-gray-50 text-gray-600',
  },
};

const getStatusMeta = (status?: StudyStatus) => {
  if (!status) return STATUS_META.NONE;
  return STATUS_META[status];
};

const getUnderstandMeta = (value?: boolean | null) =>
  value == null ? UNDERSTAND_META['null'] : UNDERSTAND_META[value ? 'true' : 'false'];

const toInlineContent = (raw?: string | null) => JSON.stringify(parseEditorContent(raw));

const ProgressModal = ({ publishData, onClose }: ProgressModalProps) => {
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);

  useEffect(() => {
    if (selectedGroupIndex >= publishData.data.length) {
      setSelectedGroupIndex(0);
    }
  }, [publishData.data.length, selectedGroupIndex]);

  const summary = useMemo(() => {
    const total = publishData.data.length;
    const done = publishData.data.filter((group) => group.progress === 'DONE').length;
    const doing = publishData.data.filter((group) => group.progress === 'DOING').length;
    const progressRate = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, doing, progressRate };
  }, [publishData.data]);

  const selectedGroup = publishData.data[selectedGroupIndex];
  const mainProblem = selectedGroup?.problem;
  const childProblems = selectedGroup?.childProblems ?? [];

  return (
    <div className='w-[90vw] max-w-7xl rounded-2xl border border-gray-200 bg-white'>
      {/* Header */}
      <div className='sticky top-0 z-10 flex items-center justify-between bg-white/70 px-8 py-6 shadow-md/5 backdrop-blur-md'>
        <div className='flex items-center gap-4'>
          <div className='bg-main flex h-10 w-10 items-center justify-center rounded-2xl'>
            <Package className='h-5 w-5 text-white' />
          </div>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>{publishData.problemSet.title}</h2>
            <p className='text-sm text-gray-500'>
              {dayjs(publishData.publishAt).format('YYYY년 M월 D일')}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <span
            className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-semibold ${PROGRESS_META[publishData.progress].className}`}>
            {PROGRESS_META[publishData.progress].label}
          </span>
          <button
            type='button'
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-600'>
            <X className='h-4 w-4' />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className='grid lg:grid-cols-[280px_1fr]'>
        {/* Problem List */}
        <aside className='flex flex-col gap-3 border-r border-gray-200 py-8 pr-4 pl-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-semibold text-gray-700'>문제 목록</h3>
            <span className='text-xs text-gray-500'>{summary.total}개</span>
          </div>
          {publishData.data.length === 0 ? (
            <div className='flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500'>
              발행된 문제가 없습니다.
            </div>
          ) : (
            <div className='flex max-h-[calc(100vh-400px)] flex-col gap-2 overflow-y-auto pr-1'>
              {publishData.data.map((problemGroup, index) => {
                const isActive = selectedGroupIndex === index;
                return (
                  <button
                    key={problemGroup.problemId}
                    type='button'
                    onClick={() => setSelectedGroupIndex(index)}
                    className={`rounded-xl border px-3 py-3 text-left transition-all duration-200 ${
                      isActive
                        ? 'border-main bg-main/5 text-main'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1'>
                        <p
                          className={`text-xs font-semibold tracking-wide uppercase ${isActive ? 'text-main' : 'text-gray-400'}`}>
                          문제 {problemGroup.no}
                        </p>
                        <p
                          className={`mt-1 line-clamp-2 text-sm font-semibold ${isActive ? 'text-main' : 'text-gray-900'}`}>
                          {problemGroup.problem.title || '제목 없음'}
                        </p>
                        <p className='mt-1 text-xs text-gray-500'>
                          새끼 문제 {problemGroup.childProblems.length}개
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold ${PROGRESS_META[problemGroup.progress].className}`}>
                        {PROGRESS_META[problemGroup.progress].label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Problem Detail - Side by Side */}
        {!selectedGroup ? (
          <div className='flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center'>
            <FileText className='h-12 w-12 text-gray-300' />
            <div>
              <p className='text-base font-semibold text-gray-900'>문제를 선택해 주세요</p>
              <p className='text-sm text-gray-500'>
                왼쪽 목록에서 살펴볼 문제를 선택할 수 있습니다
              </p>
            </div>
          </div>
        ) : (
          <div className='grid xl:grid-cols-2'>
            {/* Main Problem */}
            <div className='flex flex-col gap-4 border-r border-gray-200 px-6 py-8'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold text-gray-700'>메인 문제</h3>
                {mainProblem && (
                  <span
                    className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${getStatusMeta(mainProblem.progress).className}`}>
                    {getStatusMeta(mainProblem.progress).label}
                  </span>
                )}
              </div>

              <div className='flex flex-col gap-4 overflow-y-auto rounded-xl border border-gray-200 bg-white p-5'>
                <h4 className='mt-1 text-base font-bold text-gray-900'>
                  {mainProblem?.title || '제목 없음'}
                </h4>

                <div className='overflow-hidden rounded-xl border border-gray-200 bg-gray-50'>
                  <ProblemViewer
                    content={parseEditorContent(mainProblem?.problemContent)}
                    padding={24}
                  />
                </div>

                {/* Main Pointings */}
                {mainProblem?.pointings && mainProblem.pointings.length > 0 && (
                  <div className='border-t border-gray-100 pt-4'>
                    <div className='mb-3 flex items-center justify-between'>
                      <h4 className='text-sm font-semibold text-gray-700'>포인팅</h4>
                      <span className='text-xs text-gray-500'>
                        {mainProblem.pointings.length}개
                      </span>
                    </div>
                    <div className='space-y-2'>
                      {mainProblem.pointings.map((pointing) => {
                        const questionMeta = getUnderstandMeta(pointing.isQuestionUnderstood);
                        const commentMeta = getUnderstandMeta(pointing.isCommentUnderstood);
                        return (
                          <div
                            key={pointing.id}
                            className='rounded-lg border border-gray-100 bg-gray-50 p-3'>
                            <div className='flex items-start gap-3'>
                              <div className='flex-1 text-sm text-gray-900'>
                                <InlineProblemViewer maxLine={3}>
                                  {toInlineContent(pointing.questionContent)}
                                </InlineProblemViewer>
                              </div>
                              <span
                                className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold ${questionMeta.className}`}>
                                질문: {questionMeta.label}
                              </span>
                            </div>
                            {pointing.commentContent && (
                              <div className='mt-2 flex items-start gap-3 border-t border-gray-100 pt-2 text-xs text-gray-500'>
                                <div className='flex-1'>
                                  <InlineProblemViewer maxLine={2}>
                                    {toInlineContent(pointing.commentContent)}
                                  </InlineProblemViewer>
                                </div>
                                <span
                                  className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold ${commentMeta.className}`}>
                                  해설: {commentMeta.label}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Child Problems */}
            <div className='flex flex-col gap-4 px-6 py-8'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-semibold text-gray-700'>새끼 문제</h3>
                <span className='text-xs text-gray-500'>{childProblems.length}개</span>
              </div>

              {childProblems.length > 0 ? (
                <div className='flex flex-col gap-3 overflow-y-auto'>
                  {childProblems.map((child, index) => (
                    <div
                      key={child.id ?? index}
                      className='rounded-xl border border-gray-200 bg-white p-4'>
                      <div className='mb-3 flex items-start justify-between gap-3'>
                        <div>
                          <p className='text-xs font-semibold tracking-wide text-gray-400 uppercase'>
                            새끼 문제 {index + 1}
                          </p>
                          <h5 className='mt-1 text-sm font-semibold text-gray-900'>
                            {child.title || child.parentProblemTitle || '제목 없음'}
                          </h5>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold ${getStatusMeta(child.progress).className}`}>
                          {getStatusMeta(child.progress).label}
                        </span>
                      </div>
                      <div className='overflow-hidden rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900'>
                        <ProblemViewer
                          content={parseEditorContent(child.problemContent)}
                          padding={24}
                        />
                      </div>

                      {/* Child Pointings */}
                      {child.pointings && child.pointings.length > 0 && (
                        <div className='mt-3 border-t border-gray-100 pt-3'>
                          <p className='mb-2 text-xs font-semibold text-gray-500'>
                            포인팅 {child.pointings.length}개
                          </p>
                          <div className='space-y-2'>
                            {child.pointings.map((pointing) => {
                              const questionMeta = getUnderstandMeta(pointing.isQuestionUnderstood);
                              const commentMeta = getUnderstandMeta(pointing.isCommentUnderstood);
                              return (
                                <div
                                  key={pointing.id}
                                  className='rounded-lg border border-gray-100 bg-gray-50 p-3'>
                                  <div className='flex items-start gap-3'>
                                    <div className='flex-1 text-sm text-gray-900'>
                                      <InlineProblemViewer maxLine={3}>
                                        {toInlineContent(pointing.questionContent)}
                                      </InlineProblemViewer>
                                    </div>
                                    <span
                                      className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold ${questionMeta.className}`}>
                                      질문: {questionMeta.label}
                                    </span>
                                  </div>
                                  {pointing.commentContent && (
                                    <div className='mt-2 flex items-start gap-3 border-t border-gray-100 pt-2 text-xs text-gray-500'>
                                      <div className='flex-1'>
                                        <InlineProblemViewer maxLine={2}>
                                          {toInlineContent(pointing.commentContent)}
                                        </InlineProblemViewer>
                                      </div>
                                      <span
                                        className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-semibold ${commentMeta.className}`}>
                                        해설: {commentMeta.label}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className='flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-center text-sm text-gray-500'>
                  새끼 문제가 없습니다.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressModal;
